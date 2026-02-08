import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { z } from "zod";

const creatorPostSchema = z.object({
  link: z.string().url(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const posts = await prisma.creatorPost.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        coupon: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/creator-posts error:", error);
    return NextResponse.json(
      { message: "Failed to fetch creator posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = creatorPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const post = await prisma.creatorPost.create({
      data: {
        userId: session.user.id,
        link: parsed.data.link,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST /api/creator-posts error:", error);
    return NextResponse.json(
      { message: "Failed to submit creator post" },
      { status: 500 },
    );
  }
}
