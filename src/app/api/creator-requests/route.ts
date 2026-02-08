import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const creatorRequestSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  instagramHandle: z.string().min(1),
  followers: z.coerce.number().int().min(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "USER") {
    return NextResponse.json(
      { message: "Only regular users can request to become a creator" },
      { status: 403 },
    );
  }

  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = creatorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.creatorRequest.findUnique({
      where: { userId },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        return NextResponse.json(
          { message: "You already have a pending request" },
          { status: 409 },
        );
      }
      if (existing.status === "APPROVED") {
        return NextResponse.json(
          { message: "You are already a creator" },
          { status: 409 },
        );
      }
      const updated = await prisma.creatorRequest.update({
        where: { userId },
        data: {
          status: "PENDING",
          ...parsed.data,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.creatorRequest.create({
      data: {
        userId,
        status: "PENDING",
        ...parsed.data,
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST /api/creator-requests error:", error);
    return NextResponse.json(
      { message: "Failed to create creator request" },
      { status: 500 },
    );
  }
}
