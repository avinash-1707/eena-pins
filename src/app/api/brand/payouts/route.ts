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
            { message: "Only brands can access payout history" },
            { status: 403 }
        );
    }

    try {
        const brandProfile = await prisma.brandProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!brandProfile) {
            return NextResponse.json(
                { message: "Brand profile not found" },
                { status: 404 }
            );
        }

        const payouts = await prisma.payout.findMany({
            where: { brandProfileId: brandProfile.id },
            orderBy: { createdAt: "desc" },
            include: {
                order: {
                    select: { id: true, receipt: true, createdAt: true },
                },
            },
        });

        const totalReleased = payouts
            .filter((p) => p.status === "RELEASED")
            .reduce((sum, p) => sum + p.amount, 0);

        return NextResponse.json({
            payouts: payouts.map((p) => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt,
                releasedAt: p.releasedAt,
                orderReceipt: p.order.receipt,
                orderId: p.order.id,
            })),
            totalReleased,
        });
    } catch (error) {
        console.error("GET /api/brand/payouts error:", error);
        return NextResponse.json(
            { message: "Failed to fetch payouts" },
            { status: 500 }
        );
    }
}
