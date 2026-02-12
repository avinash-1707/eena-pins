import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { decodeBrandRequestMessage } from "@/lib/brand-request-application";

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
        const requests = await prisma.brandRequest.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    },
                },
            },
        });

        const normalized = requests.map((request) => {
            const parsed = decodeBrandRequestMessage(request.message);
            return {
                ...request,
                message: parsed.plainMessage,
                application: parsed.application,
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("GET /api/admin/brand-requests error:", error);
        return NextResponse.json(
            { message: "Failed to fetch brand requests" },
            { status: 500 }
        );
    }
}
