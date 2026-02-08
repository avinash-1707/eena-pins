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
    const creatorRequest = await prisma.creatorRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!creatorRequest) {
      return NextResponse.json(
        { message: "Creator request not found" },
        { status: 404 },
      );
    }

    if (creatorRequest.status !== "PENDING") {
      return NextResponse.json(
        { message: "Request has already been processed" },
        { status: 400 },
      );
    }

    const adminId = token.sub ?? token.id;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: creatorRequest.userId },
        data: { role: "CREATOR" },
      });

      await tx.creatorProfile.upsert({
        where: { userId: creatorRequest.userId },
        update: {
          isApproved: true,
          fullName: creatorRequest.fullName,
          username: creatorRequest.username,
          instagramHandle: creatorRequest.instagramHandle,
          followers: creatorRequest.followers,
        },
        create: {
          userId: creatorRequest.userId,
          fullName: creatorRequest.fullName,
          username: creatorRequest.username,
          instagramHandle: creatorRequest.instagramHandle,
          followers: creatorRequest.followers,
          isApproved: true,
        },
      });

      await tx.creatorRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: typeof adminId === "string" ? adminId : undefined,
        },
      });

      await createCreatorCoupon({
        userId: creatorRequest.userId,
        db: tx,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "POST /api/admin/creator-requests/[id]/approve error:",
      error,
    );
    return NextResponse.json(
      { message: "Failed to approve creator request" },
      { status: 500 },
    );
  }
}
