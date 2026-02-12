import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import {
    encodeBrandRequestMessage,
    sanitizeBrandApplicationPayload,
} from "@/lib/brand-request-application";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "USER") {
        return NextResponse.json(
            { message: "Only regular users can request to become a brand" },
            { status: 403 }
        );
    }

    const userId = session.user.id;

    let body: { message?: string; application?: unknown } = {};
    try {
        body = await req.json();
    } catch {
        // optional body
    }

    const application = sanitizeBrandApplicationPayload(body.application);
    if (body.application !== undefined && !application) {
        return NextResponse.json(
            { message: "Invalid brand application data" },
            { status: 400 }
        );
    }

    const message = encodeBrandRequestMessage({
        adminNote: typeof body.message === "string" ? body.message : null,
        application,
    });

    try {
        const existing = await prisma.brandRequest.findUnique({
            where: { userId },
        });

        if (existing) {
            if (existing.status === "PENDING") {
                return NextResponse.json(
                    { message: "You already have a pending request" },
                    { status: 409 }
                );
            }
            if (existing.status === "APPROVED") {
                return NextResponse.json(
                    { message: "You are already a brand" },
                    { status: 409 }
                );
            }
            // REJECTED: allow "request again" by updating same row
            const updated = await prisma.brandRequest.update({
                where: { userId },
                data: { status: "PENDING", message },
            });
            return NextResponse.json(updated);
        }

        const created = await prisma.brandRequest.create({
            data: {
                userId,
                status: "PENDING",
                message,
            },
        });
        return NextResponse.json(created);
    } catch (error) {
        console.error("POST /api/brand-requests error:", error);
        return NextResponse.json(
            { message: "Failed to create brand request" },
            { status: 500 }
        );
    }
}
