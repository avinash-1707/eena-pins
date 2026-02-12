import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const MAX_COLLECTION_NAME_LENGTH = 60;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get("productId");

  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: { select: { products: true } },
        products: productId
          ? {
              where: { productId },
              select: { id: true },
              take: 1,
            }
          : false,
      },
    });

    return NextResponse.json({
      data: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        isPublic: collection.isPublic,
        createdAt: collection.createdAt,
        productCount: collection._count.products,
        containsProduct:
          productId && Array.isArray(collection.products)
            ? collection.products.length > 0
            : false,
      })),
    });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const nameRaw =
    typeof body === "object" && body && "name" in body
      ? (body as { name?: unknown }).name
      : undefined;
  const isPublicRaw =
    typeof body === "object" && body && "isPublic" in body
      ? (body as { isPublic?: unknown }).isPublic
      : undefined;

  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  const isPublic =
    typeof isPublicRaw === "boolean" ? isPublicRaw : true;

  if (!name) {
    return NextResponse.json(
      { message: "Collection name is required" },
      { status: 400 }
    );
  }

  if (name.length > MAX_COLLECTION_NAME_LENGTH) {
    return NextResponse.json(
      {
        message: `Collection name cannot exceed ${MAX_COLLECTION_NAME_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        isPublic,
        userId,
      },
    });

    return NextResponse.json(
      {
        message: "Collection created",
        collection: {
          id: collection.id,
          name: collection.name,
          isPublic: collection.isPublic,
          createdAt: collection.createdAt,
          productCount: 0,
          containsProduct: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/collections error:", error);

    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A collection with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create collection" },
      { status: 500 }
    );
  }
}
