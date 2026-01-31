'use client';

import React, { useState } from 'react';
import QuantitySelector from '@/components/ui/QuantitySelector';

interface ProductOptionsProps {
  colors?: string[];
  sizes?: string[];
}

const ProductOptions = ({ colors = [], sizes = [] }: ProductOptionsProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < 99) setQuantity(quantity + 1);
  };

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Color: <span className="text-gray-600 font-normal">{selectedColor}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedColor === color
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Size: <span className="text-gray-600 font-normal">{selectedSize}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedSize === size
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Quantity</p>
        <QuantitySelector
          quantity={quantity}
          onDecrease={handleDecrease}
          onIncrease={handleIncrease}
        />
      </div>
    </div>
  );
};

export default ProductOptions;