import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPhone } = await req.json();

    if (!newPhone || typeof newPhone !== "string") {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }

    // Check if phone is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { phone: newPhone },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This phone number is already in use" },
        { status: 400 },
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete old OTP records for this phone and create new one
    await prisma.phoneOTP.deleteMany({
      where: { phone: newPhone },
    });

    await prisma.phoneOTP.create({
      data: {
        phone: newPhone,
        otpHash,
        expiresAt,
        used: false,
        attempts: 0,
      },
    });

    // Send SMS
    const smsResult = await sendSMS(newPhone, otp);
    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || "Failed to send OTP" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
