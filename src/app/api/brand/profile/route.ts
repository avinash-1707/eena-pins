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
            { message: "Only brands can access brand profile" },
            { status: 403 }
        );
    }

    try {
        const brandProfile = await prisma.brandProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: { products: true, payouts: true },
                },
            },
        });

        if (!brandProfile) {
            return NextResponse.json(
                { message: "Brand profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: brandProfile.id,
            brandName: brandProfile.brandName,
            logoUrl: brandProfile.logoUrl,
            description: brandProfile.description,
            gstNumber: brandProfile.gstNumber,
            panNumber: brandProfile.panNumber,
            businessType: brandProfile.businessType,
            isApproved: brandProfile.isApproved,
            payoutEnabled: brandProfile.payoutEnabled,
            createdAt: brandProfile.createdAt,
            user: brandProfile.user,
            productCount: brandProfile._count.products,
            payoutCount: brandProfile._count.payouts,
        });
    } catch (error) {
        console.error("GET /api/brand/profile error:", error);
        return NextResponse.json(
            { message: "Failed to fetch brand profile" },
            { status: 500 }
        );
    }
}
