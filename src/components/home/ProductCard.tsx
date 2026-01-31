'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  imageHeight?: 'short' | 'medium' | 'tall';
}

const ProductCard = ({
  id,
  name,
  category,
  imageUrl,
  imageHeight = 'medium'
}: ProductCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Variable heights for masonry effect
  const heightClasses = {
    short: 'aspect-[3/4]',
    medium: 'aspect-square',
    tall: 'aspect-[3/4]'
  };

  const handleImageClick = () => {
    router.push(`/product/${id}`);
  };


  return (
    <div className="bg-white border border-gray-200 shadow-lg p-2 odd:rotate-[-2.5deg] even:rotate-[2.5deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
      {/* Image Container with Padding (Polaroid border) */}
      <div className="p-3 pb-0">
       <div
  onClick={handleImageClick}
  className={`relative ${heightClasses[imageHeight]} bg-gray-100 `}
>

          {!imageError ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Container (Bottom white space - Polaroid style) */}
       <div className="p-4 pt-3">
         <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
          {/* {category} */}
        </p>
        <h3 className="text-sm text-gray-600 font-medium line-clamp-2">
          {/* {name} */}
        </h3> 
      </div> 
    </div>
  );
};

export default ProductCard;