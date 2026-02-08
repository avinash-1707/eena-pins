import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true, payment: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (order.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (order.status === "PAID" && order.payment) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: "Payment already verified",
      });
    }

    if (order.status !== "CREATED") {
      return NextResponse.json(
        { message: "Order is not in CREATED state" },
        { status: 400 },
      );
    }

    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 },
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({
          where: { orderId: order.id },
        });
        if (existingPayment) {
          return;
        }
        await tx.payment.create({
          data: {
            orderId: order.id,
            status: "CAPTURED",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: order.totalAmount,
            currency: order.currency ?? "INR",
            paidAt: new Date(),
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { status: "USED", usedAt: new Date() },
          });
        }
      });
    } catch (err) {
      const existing = await prisma.payment.findUnique({
        where: { orderId: order.id },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: "Payment already verified",
        });
      }
      throw err;
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("POST /api/checkout/verify error:", error);
    return NextResponse.json(
      { message: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
