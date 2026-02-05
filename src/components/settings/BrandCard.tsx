'use client';

import React from 'react';
import { Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BrandCard = () => {
  const router = useRouter();

  const handleBecomePartner = () => {
    // Navigate to brand page
    router.push('/brand');
  };

  return (
    <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-red-50 rounded-2xl shadow-md p-6 relative overflow-hidden">
      {/* Decorative Icon */}
      <div className="absolute top-4 right-4 opacity-20">
        <Store className="w-20 h-20 text-amber-700" />
      </div>

      {/* Icon */}
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Store className="w-8 h-8 text-amber-700" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Are You a Brand?
      </h3>
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        Join rewards and reach thousands of design-conscious consumers. List your products with us!
      </p>

      {/* Button */}
      <button
        onClick={handleBecomePartner}
        className="bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-md"
      >
        Become a Partner
      </button>

      {/* Decorative Emoji */}
      <span className="absolute bottom-4 right-4 text-4xl">👜</span>
    </div>
  );
};

export default BrandCard;