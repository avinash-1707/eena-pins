'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import CouponSection from './CouponSection';
import { Lock, Truck } from 'lucide-react';

const SHIPPING_COST = 25;
const TAX_RATE = 0.08; // 8%

const OrderSummaryCheckout = () => {
  const { cartItems, getCartTotal } = useCart();
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const subtotal = getCartTotal();
  const shipping = SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        Order Summary 🛍️
      </h2>

      {/* Products */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {!imageErrors[item.product.id] ? (
                <Image
                  src={(item.product as any).imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(item.product.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                {item.product.name}
              </h3>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <CouponSection />

      {/* Price Breakdown */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2"></div>
        <div className="flex justify-between text-base">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Info Badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Lock className="w-4 h-4 text-green-600" />
          <span>Secure 256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Free shipping over $500</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCheckout;