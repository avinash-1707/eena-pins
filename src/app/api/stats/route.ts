import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [userCount, brandCount] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "BRAND" } }),
        ]);

        return NextResponse.json({
            users: userCount,
            brands: brandCount,
        });
    } catch (error) {
        console.error("GET /api/stats error:", error);
        return NextResponse.json(
            { message: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
