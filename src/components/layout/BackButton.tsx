"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackButton = () => {
    const router = useRouter();
    return (
       
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

    );
};
export default BackButton;