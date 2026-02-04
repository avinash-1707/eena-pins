import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "BRAND") {
    return NextResponse.json(
      { message: "Only brands can access order history" },
      { status: 403 },
    );
  }

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json(
        { message: "Brand profile not found" },
        { status: 404 },
      );
    }

    // Get all order items for this brand's products
    const orderItems = await prisma.orderItem.findMany({
      where: { brandProfileId: brandProfile.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            platformFee: true,
            createdAt: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    // Group by order and calculate per-order earnings
    const orderMap = new Map<
      string,
      {
        id: string;
        status: string;
        totalAmount: number;
        platformFee: number;
        createdAt: string;
        deliveredAt: string | null;
        items: Array<{
          id: string;
          productId: string;
          quantity: number;
          price: number;
          commission: number;
          brandAmount: number;
        }>;
      }
    >();

    for (const item of orderItems) {
      const orderId = item.orderId;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: item.order.id,
          status: item.order.status,
          totalAmount: item.order.totalAmount,
          platformFee: item.order.platformFee,
          createdAt: item.order.createdAt.toISOString(),
          deliveredAt: item.order.deliveredAt
            ? item.order.deliveredAt.toISOString()
            : null,
          items: [],
        });
      }
      const order = orderMap.get(orderId)!;
      order.items.push({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        commission: item.commission,
        brandAmount: item.brandAmount,
      });
    }

    // Calculate total earnings (sum of all brand amounts)
    const totalEarnings = Array.from(orderMap.values()).reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => s + item.brandAmount, 0);
    }, 0);

    return NextResponse.json({
      orders: Array.from(orderMap.values()),
      totalEarnings,
    });
  } catch (error) {
    console.error("GET /api/brand/orders error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
