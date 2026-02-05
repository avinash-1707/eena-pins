import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Missing phone or otp" },
        { status: 400 },
      );
    }

    const record = await prisma.phoneOTP.findFirst({
      where: { phone, used: false },
    });

    if (!record) {
      return NextResponse.json(
        { valid: false, error: "Invalid OTP" },
        { status: 400 },
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "OTP expired" },
        { status: 400 },
      );
    }

    if (record.attempts >= 3) {
      return NextResponse.json(
        { valid: false, error: "Too many attempts" },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(otp, record.otpHash);

    if (!valid) {
      await prisma.phoneOTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { valid: false, error: "Invalid OTP" },
        { status: 400 },
      );
    }

    // OTP is valid — do not mark it used here. Sign-in via NextAuth will consume it.
    // use findFirst to avoid throwing if the DB schema is missing a unique index
    // (this is more tolerant and only checks presence)
    const user = await prisma.user.findFirst({ where: { phone } });

    return NextResponse.json({ valid: true, exists: Boolean(user) });
  } catch (err) {
    // Log error for debugging
    // eslint-disable-next-line no-console
    console.error("/api/auth/phone/verify error:", err);
    const message = (err as Error)?.message ?? "Server error";
    const body =
      process.env.NODE_ENV === "production"
        ? { error: "Server error" }
        : { error: message };
    return NextResponse.json(body, { status: 500 });
  }
}
