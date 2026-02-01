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

    try {
        // 1️⃣ Fetch brand profile
        const brandProfile = await prisma.brandProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true, isApproved: true },
        });

        if (!brandProfile || !brandProfile.isApproved) {
            return NextResponse.json(
                { message: "Brand profile not approved" },
                { status: 403 }
            );
        }

        const brandProfileId = brandProfile.id;

        // 2️⃣ Run dashboard queries
        const [productCount, payoutAgg, products] =
            await prisma.$transaction([
                prisma.product.count({
                    where: { brandProfileId },
                }),

                prisma.payout.aggregate({
                    where: { brandProfileId, status: "RELEASED" },
                    _sum: { amount: true },
                }),

                prisma.product.findMany({
                    where: { brandProfileId },
                    orderBy: { createdAt: "desc" },
                    include: {
                        details: true,
                        ratings: { select: { rating: true } },
                    },
                }),
            ]);

        // 3️⃣ Compute ratings
        const enrichedProducts = products.map((p) => {
            const ratingCount = p.ratings.length;
            const avgRating =
                ratingCount > 0
                    ? p.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
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
                ratingCount,
                details: p.details,
            };
        });

        return NextResponse.json({
            productCount,
            totalPayout: payoutAgg._sum.amount ?? 0,
            products: enrichedProducts,
        });
    } catch (error) {
        console.error("GET /api/brand/dashboard error:", error);
        return NextResponse.json(
            { message: "Failed to fetch brand dashboard" },
            { status: 500 }
        );
    }
}
