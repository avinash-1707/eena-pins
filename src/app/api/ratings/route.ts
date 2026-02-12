import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import type { OrderStatus } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RATE_ELIGIBLE_ORDER_STATUSES = new Set<OrderStatus>([
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

const createRatingSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createRatingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { orderId, productId, rating, review } = parsed.data;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        items: {
          where: { productId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found for this user" },
        { status: 404 },
      );
    }

    if (!RATE_ELIGIBLE_ORDER_STATUSES.has(order.status)) {
      return NextResponse.json(
        { message: "You can rate only paid or fulfilled orders" },
        { status: 403 },
      );
    }

    if (order.items.length === 0) {
      return NextResponse.json(
        { message: "This product is not part of the selected order" },
        { status: 403 },
      );
    }

    const savedRating = await prisma.userRating.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        rating,
        review: review || null,
      },
      update: {
        rating,
        review: review || null,
      },
      select: {
        id: true,
        rating: true,
        review: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Rating saved",
        rating: savedRating,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/ratings error:", error);
    return NextResponse.json(
      { message: "Failed to save rating" },
      { status: 500 },
    );
  }
}
