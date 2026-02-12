'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/context/CartContext';
import { formatInrFromPaise } from '@/lib/currency';

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [imageError, setImageError] = useState(false);

  // Get imageUrl safely
  const imageUrl = (item.product as any).imageUrl || '/images/placeholder.png';

  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.product.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden p-4 flex gap-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={item.product.name || 'Product Image'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-orange-500 uppercase mb-1">
            {item.product.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
            {item.product.name}
          </h3>
          <p className="text-lg font-bold text-gray-900">
            {formatInrFromPaise(item.product.price)}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Quantity:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-all text-lg font-bold"
            >
              −
            </button>
            <span className="text-base font-semibold text-gray-800 min-w-[1.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-all text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleRemove}
        className="self-start p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default CartItemCard;
