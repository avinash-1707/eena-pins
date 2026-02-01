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
            include: { user: true },
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

        await prisma.$transaction([
            // 1️⃣ Promote user to BRAND
            prisma.user.update({
                where: { id: brandRequest.userId },
                data: { role: "BRAND" },
            }),

            // 2️⃣ Ensure brand profile exists & is approved
            prisma.brandProfile.upsert({
                where: { userId: brandRequest.userId },
                update: {
                    isApproved: true,
                },
                create: {
                    userId: brandRequest.userId,
                    brandName:
                        brandRequest.user.name?.trim() ||
                        brandRequest.user.username,
                    description: null,
                    isApproved: true,
                },
            }),

            // 3️⃣ Mark request as approved
            prisma.brandRequest.update({
                where: { id },
                data: {
                    status: "APPROVED",
                    reviewedAt: new Date(),
                    reviewedById:
                        typeof adminId === "string" ? adminId : undefined,
                },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(
            "POST /api/admin/brand-requests/[id]/approve error:",
            error
        );
        return NextResponse.json(
            { message: "Failed to approve brand request" },
            { status: 500 }
        );
    }
}
