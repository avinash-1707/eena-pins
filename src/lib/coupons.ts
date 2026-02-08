import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export const DEFAULT_CREATOR_DISCOUNT_PERCENT = 60;
export const DEFAULT_CREATOR_COUPON_TTL_DAYS = 30;

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function generateCouponCode(prefix = "CREATOR") {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

export function getCouponExpiryDate(days = DEFAULT_CREATOR_COUPON_TTL_DAYS) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export async function validateCouponForUser(userId: string, code: string) {
  const normalized = normalizeCouponCode(code);
  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
  });

  if (!coupon) {
    return { valid: false, reason: "not_found" as const };
  }

  if (coupon.userId !== userId) {
    return { valid: false, reason: "not_owner" as const };
  }

  if (coupon.status !== "ACTIVE") {
    return { valid: false, reason: "not_active" as const };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { status: "EXPIRED" },
    });
    return { valid: false, reason: "expired" as const };
  }

  return { valid: true, coupon };
}

type CouponClient = Prisma.TransactionClient | typeof prisma;

export async function createCreatorCoupon(params: {
  userId: string;
  discountPercent?: number;
  creatorPostId?: string | null;
  expiresAt?: Date | null;
  db?: CouponClient;
}) {
  const discountPercent =
    params.discountPercent ?? DEFAULT_CREATOR_DISCOUNT_PERCENT;
  const code = generateCouponCode("CREATOR");
  const db = params.db ?? prisma;
  return db.coupon.create({
    data: {
      userId: params.userId,
      code,
      discountPercent,
      status: "ACTIVE",
      creatorPostId: params.creatorPostId ?? undefined,
      expiresAt: params.expiresAt ?? getCouponExpiryDate(),
    },
  });
}
