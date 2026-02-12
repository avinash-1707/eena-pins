export function formatInrFromPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getDiscountPercentage(
  fullPricePaise: number,
  discountedPricePaise: number,
): number {
  if (fullPricePaise <= 0 || discountedPricePaise >= fullPricePaise) return 0;
  return Math.round(
    ((fullPricePaise - discountedPricePaise) / fullPricePaise) * 100,
  );
}
