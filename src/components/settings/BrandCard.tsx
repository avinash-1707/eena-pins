'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BrandCard = () => {
  const router = useRouter();

  const handleBecomePartner = () => {
    router.push('/settings/BrandFormPage');
  };

  return (
    <div className="bg-[#FFF8E8] rounded-2xl shadow-sm px-8 py-10 text-center relative">
      
      {/* Icon */}
      <div className="w-14 h-14 bg-transparent flex items-center justify-center mx-auto mb-6">
        <Globe className="w-7 h-7 text-[#8B7A5E]" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
        Are You a Brand?
      </h3>

      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Join Haven and reach thousands of design-conscious customers.
        List your products and grow your business with us.
      </p>

      {/* Button */}
      <button
        onClick={handleBecomePartner}
        className="bg-[#1F2B1E] hover:bg-[#162016] text-white font-medium px-8 py-3 rounded-full transition-all active:scale-95"
      >
        Become a Partner
      </button>

    </div>
  );
};

export default BrandCard;
