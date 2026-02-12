import React from "react";
import Rating from "@/components/ui/Rating";
import { formatInrFromPaise, getDiscountPercentage } from "@/lib/currency";

interface ProductInfoProps {
  name: string;
  fullPrice?: number;
  price: number; // stored in paise
  description: string;
  rating: number;
  totalReviews: number;
}

const ProductInfo = ({
  name,
  fullPrice,
  price,
  description,
  rating,
  totalReviews,
}: ProductInfoProps) => {
  const discountPercent = getDiscountPercentage(fullPrice ?? 0, price);

  return (
    <div className="px-4 pb-6">
      {/* Rating */}
      <div className="mb-3">
        <Rating
          rating={rating}
          showNumber
          totalReviews={totalReviews}
          size="md"
        />
      </div>

      {/* Product Name */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>

      {/* Price */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900">
          {formatInrFromPaise(price)}
        </p>
        {fullPrice && fullPrice > price && (
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-gray-500 line-through">
              {formatInrFromPaise(fullPrice)}
            </p>
            <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default ProductInfo;
