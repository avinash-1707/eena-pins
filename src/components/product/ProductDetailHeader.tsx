"use client";

import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ProductDetailHeader = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Check out this product',
        url: window.location.href
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Title (optional) */}
        <h1 className="text-lg font-semibold text-gray-900">Product</h1>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          aria-label="Share"
        >
          <Share2 className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default ProductDetailHeader;