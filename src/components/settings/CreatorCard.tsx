'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreatorCard = () => {
  const router = useRouter();

  const handleBecomeCreator = () => {
    router.push('/settings/creator-application');
  };

  return (
    <div className="bg-[#FFF5F8] rounded-2xl shadow-sm px-8 py-10 text-center relative">
      
      {/* Icon */}
      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
        <Globe className="w-7 h-7 text-black" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
        Become a Creator
      </h3>

      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Are you a home lifestyle influencer? Join our creator program and unlock exclusive benefits!
      </p>

      {/* Button */}
      <button
        onClick={handleBecomeCreator}
        className="bg-[#E9FF2F] hover:bg-[#dcf02b] text-black font-medium px-8 py-3 rounded-full transition-all active:scale-95"
      >
        Become a Creator
      </button>

      {/* Decorative emojis */}
      
    </div>
  );
};

export default CreatorCard;
