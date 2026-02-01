import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                username: true,
                name: true,
                description: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        collections: true,
                        ratings: true,
                    },
                },
                brandRequest: {
                    select: { status: true },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const { brandRequest, ...rest } = user;
        return NextResponse.json({
            ...rest,
            brandRequestStatus: brandRequest?.status ?? null,
        });
    } catch (error) {
        console.error("GET /api/profile/me error:", error);
        return NextResponse.json(
            { message: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
