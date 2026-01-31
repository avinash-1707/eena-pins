'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ProductDetailsSectionProps {
  brand?: string | null;
  material?: string | null;
  keyFeatures: string[];
  moreOptions?: Record<string, any> | null;
}

const ProductDetailsSection = ({ brand, material, keyFeatures, moreOptions }: ProductDetailsSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="px-4 pb-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Product Details 📦
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Content */}
        {isOpen && (
          <div className="px-4 pb-4 space-y-4">
            {/* Brand */}
            {brand && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Brand</p>
                <p className="text-sm text-gray-600">{brand}</p>
              </div>
            )}

            {/* Materials */}
            {material && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Materials</p>
                <p className="text-sm text-gray-600">{material}</p>
              </div>
            )}

            {/* Dimensions */}
            {moreOptions?.dimensions && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Dimensions</p>
                <p className="text-sm text-gray-600">{moreOptions.dimensions}</p>
              </div>
            )}

            {/* Key Features */}
            {keyFeatures.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Key Features</p>
                <ul className="space-y-1.5">
                  {keyFeatures.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weight */}
            {moreOptions?.weight && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Weight</p>
                <p className="text-sm text-gray-600">{moreOptions.weight}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsSection;