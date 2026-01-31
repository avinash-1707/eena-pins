// app/api/auth/phone/send-otp/route.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);

  await prisma.phoneOTP.deleteMany({ where: { phone } });

  await prisma.phoneOTP.create({
    data: {
      phone,
      otpHash: hash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await sendSMS(phone, `Your OTP is ${otp}`);

  return Response.json({ success: true });
}
