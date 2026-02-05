import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationToken,
  getVerificationEmailHTML,
  sendEmail,
} from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await req.json();

    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 },
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: tokenExpiresAt,
      },
    });

    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/profile/me?verifyEmail=${verificationToken}&newEmail=${encodeURIComponent(newEmail)}`;

    // Send verification email
    const emailHtml = getVerificationEmailHTML(verificationLink);
    const result = await sendEmail({
      to: newEmail,
      subject: "Verify your new email address",
      html: emailHtml,
    });

    if (!result.success) {
      // Clear the tokens if email sending failed
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
        },
      });

      return NextResponse.json(
        {
          error: result.error || "Failed to send verification email",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
