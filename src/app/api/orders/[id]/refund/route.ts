import { prisma } from "@/lib/prisma";
import { createRefund } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only admin can create refunds" },
        { status: 403 },
      );
    }
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { message: "Order already refunded" },
        { status: 400 },
      );
    }
    if (!order.payment?.razorpayPaymentId) {
      return NextResponse.json(
        { message: "No payment to refund" },
        { status: 400 },
      );
    }

    let razorpayRefundId: string;
    try {
      const refund = await createRefund(order.payment.razorpayPaymentId);
      razorpayRefundId = refund.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refund failed";
      console.error("Razorpay refund error:", err);
      return NextResponse.json(
        { message: `Razorpay refund failed: ${message}` },
        { status: 502 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          razorpayRefundId,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });
    });

    return NextResponse.json({
      message: "Refund processed",
      orderId,
      razorpayRefundId,
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/refund error:", error);
    return NextResponse.json(
      { message: "Failed to process refund" },
      { status: 500 },
    );
  }
}
