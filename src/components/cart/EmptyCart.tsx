'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const EmptyCart = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100 rounded-full p-8 mb-6">
        <ShoppingBag className="w-16 h-16 text-purple-600" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      
      <p className="text-sm text-gray-500 mb-6 text-center">
        Add some products to get started!
      </p>

      <Button
        variant="primary"
        onClick={() => router.push('/')}
        icon={<ShoppingBag className="w-5 h-5" />}
      >
        Continue Shopping
      </Button>
    </div>
  );
};

export default EmptyCart;