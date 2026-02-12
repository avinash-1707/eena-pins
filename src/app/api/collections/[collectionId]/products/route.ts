import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

  const productId =
    typeof body === "object" && body && "productId" in body
      ? (body as { productId?: unknown }).productId
      : undefined;

  if (typeof productId !== "string" || !productId.trim()) {
    return NextResponse.json(
      { message: "Product id is required" },
      { status: 400 }
    );
  }

  try {
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
      select: { id: true },
    });

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        message: "Product already saved to this collection",
        alreadySaved: true,
      });
    }

    await prisma.collectionProduct.create({
      data: {
        collectionId,
        productId,
      },
    });

    return NextResponse.json(
      {
        message: "Product added to collection",
        alreadySaved: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/collections/[collectionId]/products error:", error);
    return NextResponse.json(
      { message: "Failed to add product to collection" },
      { status: 500 }
    );
  }
}
