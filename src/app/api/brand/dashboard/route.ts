import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "BRAND") {
        return NextResponse.json(
            { message: "Only brands can access this dashboard" },
            { status: 403 }
        );
    }

    const brandId = session.user.id;

    try {
        const [productCount, payoutAgg, products] = await prisma.$transaction([
            prisma.product.count({ where: { brandId } }),
            prisma.payout.aggregate({
                where: { brandId },
                _sum: { amount: true },
            }),
            prisma.product.findMany({
                where: { brandId },
                orderBy: { createdAt: "desc" },
                include: {
                    details: true,
                    ratings: { select: { rating: true } },
                },
            }),
        ]);

        const totalPayout = payoutAgg._sum.amount ?? 0;

        const enriched = products.map((p) => {
            const avgRating =
                p.ratings.length > 0
                    ? p.ratings.reduce((a, b) => a + b.rating, 0) / p.ratings.length
                    : null;
            return {
                id: p.id,
                name: p.name,
                price: p.price,
                imageUrl: p.imageUrl,
                category: p.category,
                description: p.description,
                createdAt: p.createdAt,
                avgRating,
                ratingCount: p.ratings.length,
                details: p.details,
            };
        });

        return NextResponse.json({
            productCount,
            totalPayout,
            products: enriched,
        });
    } catch (error) {
        console.error("GET /api/brand/dashboard error:", error);
        return NextResponse.json(
            { message: "Failed to fetch brand dashboard" },
            { status: 500 }
        );
    }
}
