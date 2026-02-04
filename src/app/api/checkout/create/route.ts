import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { computeItemSplit } from "@/lib/commission";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";

const createCheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = createCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { items: requestItems, idempotencyKey } = parsed.data;

    if (idempotencyKey) {
      const existing = await prisma.order.findFirst({
        where: { userId, receipt: idempotencyKey, status: "CREATED" },
        select: { id: true, razorpayOrderId: true, totalAmount: true, currency: true },
      });
      if (existing?.razorpayOrderId) {
        return NextResponse.json({
          orderId: existing.id,
          razorpayOrderId: existing.razorpayOrderId,
          amount: existing.totalAmount,
          currency: existing.currency ?? "INR",
        });
      }
    }

    const productIds = [...new Set(requestItems.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, brandProfileId: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const missing = productIds.filter((id) => !productMap.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { message: "Some products not found", productIds: missing },
        { status: 400 }
      );
    }

    const orderLines: { productId: string; brandProfileId: string; quantity: number; price: number; commission: number; brandAmount: number }[] = [];
    let totalAmount = 0;
    let platformFee = 0;

    for (const { productId, quantity } of requestItems) {
      const product = productMap.get(productId)!;
      const itemTotal = product.price * quantity;
      const { commission, brandAmount } = computeItemSplit(itemTotal);
      orderLines.push({
        productId,
        brandProfileId: product.brandProfileId,
        quantity,
        price: itemTotal,
        commission,
        brandAmount,
      });
      totalAmount += itemTotal;
      platformFee += commission;
    }

    if (totalAmount < 100) {
      return NextResponse.json(
        { message: "Order total must be at least ₹1.00 (100 paise)" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: "CREATED",
          totalAmount,
          platformFee,
          currency: "INR",
          receipt: idempotencyKey ?? undefined, // keep for idempotency lookup; else set to order.id below
        },
      });
      for (const line of orderLines) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: line.productId,
            brandProfileId: line.brandProfileId,
            quantity: line.quantity,
            price: line.price,
            commission: line.commission,
            brandAmount: line.brandAmount,
          },
        });
      }
      return created;
    });

    const razorpayOrderId = await createRazorpayOrder({
      amount: order.totalAmount,
      currency: "INR",
      receipt: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId, receipt: order.receipt || order.id },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId,
      amount: order.totalAmount,
      currency: order.currency ?? "INR",
    });
  } catch (error) {
    console.error("POST /api/checkout/create error:", error);
    return NextResponse.json(
      { message: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
