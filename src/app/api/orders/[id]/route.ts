import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";

const RETURN_WINDOW_DAYS = 7;

const allowedTransitions: Record<string, string[]> = {
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
            brandProfile: { select: { id: true, brandName: true } },
          },
        },
        payment: { select: { status: true, amount: true, paidAt: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isOwner = order.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const brandProfile = session.user.role === "BRAND"
      ? await prisma.brandProfile.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
      : null;
    const hasBrandItems =
      brandProfile &&
      order.items.some((i) => i.brandProfileId === brandProfile.id);

    if (!isOwner && !isAdmin && !hasBrandItems) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

const updateOrderSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { status: newStatus } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const brandProfile =
      session.user.role === "BRAND"
        ? await prisma.brandProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          })
        : null;
    const hasBrandItems =
      brandProfile &&
      order.items.some((i) => i.brandProfileId === brandProfile.id);

    if (!isAdmin && !hasBrandItems) {
      return NextResponse.json(
        { message: "Only brand or admin can update order status" },
        { status: 403 }
      );
    }

    const allowed = allowedTransitions[order.status];
    if (!allowed?.includes(newStatus)) {
      return NextResponse.json(
        {
          message: `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${allowed?.join(", ") ?? "none"}`,
        },
        { status: 400 }
      );
    }

    const updateData: {
      status: OrderStatus;
      deliveredAt?: Date;
      returnWindowEndsAt?: Date;
    } = {
      status: newStatus,
    };
    if (newStatus === "DELIVERED") {
      const now = new Date();
      updateData.deliveredAt = now;
      const returnEnd = new Date(now);
      returnEnd.setDate(returnEnd.getDate() + RETURN_WINDOW_DAYS);
      updateData.returnWindowEndsAt = returnEnd;
    }

    await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Order updated",
      status: newStatus,
      ...(newStatus === "DELIVERED" && {
        deliveredAt: updateData.deliveredAt,
        returnWindowEndsAt: updateData.returnWindowEndsAt,
      }),
    });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}
