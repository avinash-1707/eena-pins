"use client";

import React from "react";
import { ArrowLeft, MessageCircle, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CartHeader = () => {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <Image
          src="/images/logo.png"
          alt="eena pins"
          width={100}
          height={32}
          className="object-contain w-20 h-auto"
        />

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MessageCircle className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default CartHeader;
