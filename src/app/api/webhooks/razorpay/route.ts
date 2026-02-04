import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { message: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json(
      { message: "Missing x-razorpay-signature" },
      { status: 400 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const valid = verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!valid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: {
        entity?: { id?: string; order_id?: string; amount?: number };
      };
    };
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  if (event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  if (!paymentEntity?.id || !paymentEntity?.order_id) {
    return NextResponse.json({ received: true });
  }

  const razorpayPaymentId = paymentEntity.id;
  const razorpayOrderId = paymentEntity.order_id;
  const amount = paymentEntity.amount;

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId },
    include: { items: true, payment: true },
  });

  if (!order) {
    return NextResponse.json({ received: true });
  }
  if (order.status === "PAID" && order.payment) {
    return NextResponse.json({ received: true });
  }
  if (order.status !== "CREATED") {
    return NextResponse.json({ received: true });
  }
  if (amount !== order.totalAmount) {
    return NextResponse.json({ received: true });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({
        where: { orderId: order.id },
      });
      if (existing) return;

      await tx.payment.create({
        data: {
          orderId: order.id,
          status: "CAPTURED",
          razorpayPaymentId,
          amount: order.totalAmount,
          currency: order.currency ?? "INR",
          paidAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    });
  } catch (err) {
    console.error("Razorpay webhook payment.captured error:", err);
    return NextResponse.json({ message: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
