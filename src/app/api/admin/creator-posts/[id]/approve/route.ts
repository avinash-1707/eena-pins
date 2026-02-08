import { prisma } from "@/lib/prisma";
import { createCreatorCoupon } from "@/lib/coupons";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (token.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const creatorPost = await prisma.creatorPost.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!creatorPost) {
      return NextResponse.json(
        { message: "Creator post not found" },
        { status: 404 },
      );
    }

    if (creatorPost.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { message: "Post has already been processed" },
        { status: 400 },
      );
    }

    if (creatorPost.user.role !== "CREATOR") {
      return NextResponse.json(
        { message: "User is not an approved creator" },
        { status: 400 },
      );
    }

    const adminId = token.sub ?? token.id;

    await prisma.$transaction(async (tx) => {
      await tx.creatorPost.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: typeof adminId === "string" ? adminId : undefined,
        },
      });

      await createCreatorCoupon({
        userId: creatorPost.userId,
        creatorPostId: creatorPost.id,
        db: tx,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "POST /api/admin/creator-posts/[id]/approve error:",
      error,
    );
    return NextResponse.json(
      { message: "Failed to approve creator post" },
      { status: 500 },
    );
  }
}
