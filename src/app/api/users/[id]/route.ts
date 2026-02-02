import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
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

    const userId = params.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        if (user.role === "ADMIN") {
            return NextResponse.json(
                { message: "Cannot delete admin users" },
                { status: 403 }
            );
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        console.error("DELETE /api/users/[id] error:", error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
        ) {
            // Foreign key constraint failed on the field
            return NextResponse.json(
                {
                    message:
                        "Cannot delete this user because they have related data (e.g. orders or ratings).",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Failed to delete user" },
            { status: 500 }
        );
    }
}

