'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ProductImageSectionProps {
  imageUrl: string;
  category: string;
  rating: number;
}

const ProductImageSection = ({ imageUrl, category, rating }: ProductImageSectionProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Polaroid Card with Image */}
      <div className="bg-white border border-gray-200 shadow-lg p-2 rotate-[-1.0deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
        {/* Image with padding (Polaroid style) */}
        <div className="p-4 pb-0">
          <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {/* Star Rating Badge */}
            {/* <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md z-10">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-800">
                {rating.toFixed(1)}
              </span>
            </div> */}

            {/* Product Image */}
            {!imageError ? (
              <Image
                src={imageUrl}
                alt="Product"
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Label (in Polaroid bottom section) */}
        <div className="px-4 py-3">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">
            {/* {category} */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductImageSection;