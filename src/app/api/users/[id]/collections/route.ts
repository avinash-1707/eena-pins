import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const canSeePrivate = viewerId === id;

    const collections = await prisma.collection.findMany({
      where: {
        userId: id,
        ...(canSeePrivate ? {} : { isPublic: true }),
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          orderBy: [{ createdAt: "desc" }],
          take: 4,
          select: {
            product: {
              select: {
                id: true,
                imageUrl: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      user,
      data: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        isPublic: collection.isPublic,
        createdAt: collection.createdAt,
        productCount: collection._count.products,
        previewProducts: collection.products.map((entry) => ({
          id: entry.product.id,
          name: entry.product.name,
          imageUrl: entry.product.imageUrl,
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/users/[id]/collections error:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
