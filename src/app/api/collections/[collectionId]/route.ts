import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { collectionId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const isPublic =
    typeof body === "object" && body && "isPublic" in body
      ? (body as { isPublic?: unknown }).isPublic
      : undefined;

  if (typeof isPublic !== "boolean") {
    return NextResponse.json(
      { message: "isPublic must be a boolean" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data: { isPublic },
      select: {
        id: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      message: "Collection visibility updated",
      collection,
    });
  } catch (error) {
    console.error("PATCH /api/collections/[collectionId] error:", error);
    return NextResponse.json(
      { message: "Failed to update collection visibility" },
      { status: 500 }
    );
  }
}
