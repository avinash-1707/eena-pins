'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreatorCard = () => {
  const router = useRouter();

  const handleBecomeCreator = () => {
    router.push('/settings/creator-application');
  };

  return (
    <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-50 rounded-2xl shadow-md p-6 relative overflow-hidden">
      {/* Decorative Icon */}
      <div className="absolute top-4 right-4 opacity-20">
        <Sparkles className="w-20 h-20 text-yellow-600" />
      </div>

      {/* Icon */}
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Sparkles className="w-8 h-8 text-yellow-600" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Become a Creator
      </h3>
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        Are you a home lifestyle influencer? Join our Creator program and unlock exclusive benefits!
      </p>

      {/* Button */}
      <button
        onClick={handleBecomeCreator}
        className="bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-gray-900 font-semibold px-6 py-3 rounded-full transition-all shadow-md"
      >
        Become a Creator
      </button>

      {/* Decorative Emoji */}
      <span className="absolute bottom-4 right-4 text-4xl">✨</span>
    </div>
  );
};

export default CreatorCard;