'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CreditCard } from 'lucide-react';

const CartActions = () => {
  const router = useRouter();

  const handleCheckout = () => {
    console.log('Proceeding to checkout...');
    // Later: router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        fullWidth
        onClick={handleCheckout}
        icon={<CreditCard className="w-5 h-5" />}
      >
        Proceed to Checkout
      </Button>

      <button
        onClick={handleContinueShopping}
        className="w-full text-center text-sm font-semibold text-gray-700 hover:text-gray-900 py-2"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default CartActions;