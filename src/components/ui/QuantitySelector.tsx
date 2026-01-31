'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}

const QuantitySelector = ({ 
  quantity, 
  onDecrease, 
  onIncrease,
  min = 1,
  max = 99
}: QuantitySelectorProps) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Minus className="w-4 h-4 text-gray-700" />
      </button>

      <span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Plus className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

export default QuantitySelector;