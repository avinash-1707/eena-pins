import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import type { OrderStatus } from "@/generated/prisma";

const RATE_ELIGIBLE_ORDER_STATUSES = new Set<OrderStatus>([
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                ratings: {
                  where: { userId: session.user.id },
                  select: {
                    id: true,
                    rating: true,
                    review: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        payment: { select: { status: true, amount: true, paidAt: true } },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    const data = orders.map((order) => ({
      ...order,
      canRateProducts: RATE_ELIGIBLE_ORDER_STATUSES.has(order.status),
      items: order.items.map((item) => ({
        ...item,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          myRating: item.product.ratings[0] ?? null,
        },
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
