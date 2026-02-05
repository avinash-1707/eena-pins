import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPhone, otp } = await req.json();

    if (!newPhone || !otp) {
      return NextResponse.json(
        { error: "Missing phone or OTP" },
        { status: 400 },
      );
    }

    // Get the OTP record
    const otpRecord = await prisma.phoneOTP.findFirst({
      where: { phone: newPhone, used: false },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or already used" },
        { status: 400 },
      );
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many failed attempts. Request a new OTP." },
        { status: 400 },
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      await prisma.phoneOTP.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        {
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        },
        { status: 400 },
      );
    }

    // Mark OTP as used and update user's phone
    await Promise.all([
      prisma.phoneOTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { phone: newPhone },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Phone number updated successfully",
    });
  } catch (error) {
    console.error("Confirm phone error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
