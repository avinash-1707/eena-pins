"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImageSectionProps {
  imageUrl: string;
  category: string;
  rating: number;
}

const ProductImageSection = ({
  imageUrl,
  category,
  rating,
}: ProductImageSectionProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="bg-white border border-gray-200 shadow-lg p-2 pb-8 -rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer">
        <div className="p-1 pb-0">
          <div className="bg-gray-100 rounded-md overflow-hidden">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt="Product"
                width={800}
                height={1200}
                className="w-full h-auto object-contain"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageSection;
