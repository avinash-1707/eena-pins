import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    try {
        const brandRequest = await prisma.brandRequest.findUnique({
            where: { id },
        });

        if (!brandRequest) {
            return NextResponse.json(
                { message: "Brand request not found" },
                { status: 404 }
            );
        }

        if (brandRequest.status !== "PENDING") {
            return NextResponse.json(
                { message: "Request has already been processed" },
                { status: 400 }
            );
        }

        const adminId = token.sub ?? token.id;

        await prisma.brandRequest.update({
            where: { id },
            data: {
                status: "REJECTED",
                reviewedAt: new Date(),
                reviewedById: typeof adminId === "string" ? adminId : undefined,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/admin/brand-requests/[id]/reject error:", error);
        return NextResponse.json(
            { message: "Failed to reject brand request" },
            { status: 500 }
        );
    }
}
