import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const now = new Date();
    await prisma.coupon.updateMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    });

    const coupons = await prisma.coupon.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET /api/creator-coupons error:", error);
    return NextResponse.json(
      { message: "Failed to fetch creator coupons" },
      { status: 500 },
    );
  }
}
