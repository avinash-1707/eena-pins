import React from 'react';
import { Sparkles, Gift } from 'lucide-react';

const CartBanners = () => {
  return (
    <div className="space-y-3">
      {/* Free Shipping Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <p className="text-xs text-gray-700">
          Free shipping on orders over <span className="font-bold">$500</span>
        </p>
      </div>

      {/* Gift Wrapping Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
        <Gift className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-xs text-gray-700">
          Gift wrapping available at checkout
        </p>
      </div>
    </div>
  );
};

export default CartBanners;