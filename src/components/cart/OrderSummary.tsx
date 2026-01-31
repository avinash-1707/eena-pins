'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

const SHIPPING_COST = 25;
const FREE_SHIPPING_THRESHOLD = 500;

const OrderSummary = () => {
  const { getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        Order Summary 📋
      </h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold text-gray-900">
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Total */}
        <div className="flex justify-between text-base">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;