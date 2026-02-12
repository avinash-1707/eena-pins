"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  isPinned?: boolean;
  onPinRequest?: (productId: string) => void;
}

const CLICK_DELAY_MS = 220;

const ProductCard = ({
  id,
  name,
  imageUrl,
  isPinned = false,
  onPinRequest,
}: ProductCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [aspect, setAspect] = useState<"short" | "medium" | "tall">("medium");
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Variable heights for masonry effect (derived from image dimensions on load)
  const heightClasses = {
    short: "aspect-[4/3]",
    medium: "aspect-square",
    tall: "aspect-[3/4]",
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const ratio = w / h;
    setAspect(ratio > 1.1 ? "short" : ratio < 0.9 ? "tall" : "medium");
  };

  const handleImageClick = () => {
    if (!onPinRequest) {
      router.push(`/product/${id}`);
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onPinRequest(id);
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      router.push(`/product/${id}`);
      clickTimeoutRef.current = null;
    }, CLICK_DELAY_MS);
  };

  return (
    <div className="bg-white border border-gray-200 shadow-lg p-2 odd:rotate-[-2.5deg] even:rotate-[2.5deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
      {/* Image Container with Padding (Polaroid border) */}
      <div className="p-1 pb-0">
        <div
          onClick={handleImageClick}
          className={`relative ${heightClasses[aspect]} bg-gray-100 `}
        >
          {isPinned && (
            <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white shadow">
              <Pin className="h-3 w-3 fill-current" />
              Saved
            </div>
          )}
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
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
