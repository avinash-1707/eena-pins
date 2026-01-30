import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/schema/updateProductSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                details: true,
                brand: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                ratings: {
                    select: {
                        rating: true,
                        review: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        const avgRating =
            product.ratings.length > 0
                ? product.ratings.reduce((a, b) => a + b.rating, 0) /
                product.ratings.length
                : null;

        return NextResponse.json({
            ...product,
            avgRating,
            ratingCount: product.ratings.length,
        });
    } catch (error) {
        console.error("GET /products/[id] error:", error);
        return NextResponse.json(
            { message: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

/* ----------------------------- */
/* PATCH /api/products/[id]      */
/* ----------------------------- */

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 🔐 Replace with real auth/session
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "BRAND") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = updateProductSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            select: { brandId: true },
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        if (product.brandId !== userId) {
            return NextResponse.json(
                { message: "You do not own this product" },
                { status: 403 }
            );
        }

        const { details, ...productData } = parsed.data;

        await prisma.$transaction(async (tx) => {
            if (Object.keys(productData).length > 0) {
                await tx.product.update({
                    where: { id: params.id },
                    data: productData,
                });
            }

            if (details) {
                await tx.productDetail.upsert({
                    where: { productId: params.id },
                    create: {
                        productId: params.id,
                        ...details,
                    },
                    update: details,
                });
            }
        });

        return NextResponse.json({ message: "Product updated" });
    } catch (error) {
        console.error("PATCH /products/[id] error:", error);
        return NextResponse.json(
            { message: "Failed to update product" },
            { status: 500 }
        );
    }
}

/* ----------------------------- */
/* DELETE /api/products/[id]     */
/* ----------------------------- */

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "BRAND") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 403 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            select: { brandId: true },
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        if (product.brandId !== userId) {
            return NextResponse.json(
                { message: "You do not own this product" },
                { status: 403 }
            );
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        console.error("DELETE /products/[id] error:", error);
        return NextResponse.json(
            { message: "Failed to delete product" },
            { status: 500 }
        );
    }
}