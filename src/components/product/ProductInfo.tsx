import React from 'react';
import Rating from '@/components/ui/Rating';

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  rating: number;
  totalReviews: number;
}

const ProductInfo = ({ name, price, description, rating, totalReviews }: ProductInfoProps) => {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {name}
      </h1>

      {/* Price */}
      <p className="text-2xl font-bold text-gray-900 mb-4">
        ${price.toFixed(2)}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ProductInfo;