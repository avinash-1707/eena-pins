import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? 10);

        const skip = (page - 1) * limit;

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    username: true,
                    name: true,
                    avatarUrl: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.user.count(),
        ]);

        return NextResponse.json({
            data: users,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json(
            { message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
