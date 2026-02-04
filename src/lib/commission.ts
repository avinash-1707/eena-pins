/**
 * Platform commission config. All amounts in paise.
 * Never trust frontend-calculated amounts; use this server-side only.
 */

const commissionPercent = (() => {
  const raw = process.env.PLATFORM_COMMISSION_PERCENT;
  if (raw === undefined || raw === "") return 10;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0 || n > 100) return 10;
  return n;
})();

export function getPlatformCommissionPercent(): number {
  return commissionPercent;
}

/**
 * For a given item total (price * quantity in paise), compute commission and brand amount.
 */
export function computeItemSplit(itemTotalPaise: number): {
  commission: number;
  brandAmount: number;
} {
  const commission = Math.round((itemTotalPaise * commissionPercent) / 100);
  const brandAmount = itemTotalPaise - commission;
  return { commission, brandAmount };
}
