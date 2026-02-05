import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, newEmail } = await req.json();

    if (!token || !newEmail) {
      return NextResponse.json(
        { error: "Missing token or email" },
        { status: 400 },
      );
    }

    // Get user with token
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    // Check if token has expired
    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      // Clear the expired token
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
        },
      });

      return NextResponse.json(
        {
          error: "Token has expired. Please request a new verification email.",
        },
        { status: 400 },
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 },
      );
    }

    // Update user email and clear verification token
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: newEmail,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error("Confirm email error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
