import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/schema/createProductSchema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? 10);
        const category = searchParams.get("category");
        const brandProfileId = searchParams.get("brandProfileId");

        const skip = (page - 1) * limit;

        const where = {
            ...(category && { category }),
            ...(brandProfileId && { brandProfileId }),
        };

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    details: true,
                    ratings: {
                        select: { rating: true },
                    },
                    brandProfile: {
                        select: {
                            id: true,
                            brandName: true,
                            logoUrl: true,
                            isApproved: true,
                            user: {
                                select: {
                                    username: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        const enriched = products.map((p) => {
            const ratingCount = p.ratings.length;
            const avgRating =
                ratingCount > 0
                    ? p.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
                    : null;

            return {
                ...p,
                avgRating,
                ratingCount,
                ratings: undefined,
            };
        });

        return NextResponse.json({
            data: enriched,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /products error:", error);
        return NextResponse.json(
            { message: "Failed to fetch products" },
            { status: 500 }
        );
    }
}



// POST /api/products

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const headerBrandId = req.headers.get("x-user-id");
        const headerRole = req.headers.get("x-user-role");

        const brandId = headerBrandId ?? session?.user?.id;
        const role = headerRole ?? session?.user?.role;

        if (!brandId || role !== "BRAND") {
            return NextResponse.json(
                { message: "Only brands can create products" },
                { status: 403 }
            );
        }

        const brandProfile = await prisma.brandProfile.findUnique({
            where: { userId: brandId },
            select: { id: true, isApproved: true },
        });

        if (!brandProfile || !brandProfile.isApproved) {
            return NextResponse.json(
                { message: "Brand profile not approved" },
                { status: 403 }
            );
        }

        const brandProfileId = brandProfile.id;

        const body = await req.json();
        const parsed = createProductSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const {
            details,
            freeShippingOn = false,
            returnAvailable = false,
            ...productData
        } = parsed.data;

        const product = await prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    ...productData,
                    freeShippingOn,
                    returnAvailable,
                    brandProfileId,
                },
            });

            if (details) {
                await tx.productDetail.create({
                    data: {
                        ...details,
                        productId: created.id,
                    },
                });
            }

            return created;
        });

        return NextResponse.json(
            { message: "Product created", productId: product.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /products error:", error);
        return NextResponse.json(
            { message: "Failed to create product" },
            { status: 500 }
        );
    }
}