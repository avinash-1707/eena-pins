import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { computeItemSplit } from "@/lib/commission";
import { validateCouponForUser } from "@/lib/coupons";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";

const createCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().optional(),
  useShippingAsBilling: z.boolean().default(false),
  idempotencyKey: z.string().optional(),
  couponCode: z.string().optional(),
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
        { status: 400 },
      );
    }
    const {
      items: requestItems,
      shippingAddressId,
      billingAddressId,
      useShippingAsBilling,
      idempotencyKey,
      couponCode,
    } = parsed.data;

    // Validate shipping address belongs to user
    const shippingAddress = await prisma.address.findUnique({
      where: { id: shippingAddressId },
    });
    if (!shippingAddress || shippingAddress.userId !== userId) {
      return NextResponse.json(
        { message: "Invalid shipping address" },
        { status: 400 },
      );
    }

    // Validate billing address if provided
    let finalBillingAddressId = useShippingAsBilling
      ? shippingAddressId
      : billingAddressId;
    if (finalBillingAddressId && finalBillingAddressId !== shippingAddressId) {
      const billingAddress = await prisma.address.findUnique({
        where: { id: finalBillingAddressId },
      });
      if (!billingAddress || billingAddress.userId !== userId) {
        return NextResponse.json(
          { message: "Invalid billing address" },
          { status: 400 },
        );
      }
    }

    if (idempotencyKey) {
      const existing = await prisma.order.findFirst({
        where: { userId, receipt: idempotencyKey, status: "CREATED" },
        select: {
          id: true,
          razorpayOrderId: true,
          totalAmount: true,
          currency: true,
        },
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

    let coupon: { id: string; discountPercent: number } | null = null;
    if (couponCode && couponCode.trim()) {
      const validation = await validateCouponForUser(userId, couponCode);
      if (!validation.valid) {
        const message =
          validation.reason === "not_found"
            ? "Coupon not found"
            : validation.reason === "not_owner"
              ? "Coupon does not belong to you"
              : validation.reason === "expired"
                ? "Coupon has expired"
                : "Coupon is not active";
        return NextResponse.json({ message }, { status: 400 });
      }

      const existingOrder = await prisma.order.findFirst({
        where: {
          couponId: validation.coupon.id,
          status: {
            in: ["CREATED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        select: { id: true },
      });
      if (existingOrder) {
        return NextResponse.json(
          { message: "Coupon has already been used" },
          { status: 409 },
        );
      }

      coupon = {
        id: validation.coupon.id,
        discountPercent: validation.coupon.discountPercent,
      };
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
        { status: 400 },
      );
    }

    const orderLines: {
      productId: string;
      brandProfileId: string;
      quantity: number;
      price: number;
      commission: number;
      brandAmount: number;
    }[] = [];
    let totalAmount = 0;
    let platformFee = 0;
    const discountMultiplier = coupon
      ? (100 - coupon.discountPercent) / 100
      : 1;

    for (const { productId, quantity } of requestItems) {
      const product = productMap.get(productId)!;
      const itemTotal = product.price * quantity;
      const discountedTotal = Math.max(
        0,
        Math.round(itemTotal * discountMultiplier),
      );
      const { commission, brandAmount } = computeItemSplit(discountedTotal);
      orderLines.push({
        productId,
        brandProfileId: product.brandProfileId,
        quantity,
        price: discountedTotal,
        commission,
        brandAmount,
      });
      totalAmount += discountedTotal;
      platformFee += commission;
    }

    if (totalAmount < 100) {
      return NextResponse.json(
        { message: "Order total must be at least ₹1.00 (100 paise)" },
        { status: 400 },
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
          shippingAddressId,
          billingAddressId: finalBillingAddressId,
          receipt: idempotencyKey ?? undefined, // keep for idempotency lookup; else set to order.id below
          couponId: coupon?.id,
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
      { status: 500 },
    );
  }
}
