import React from 'react';
import { Truck, Shield, RotateCcw } from 'lucide-react';

interface ProductFeaturesProps {
  freeShipping: boolean;
  warrantyMonths?: number | null;
  returnAvailable: boolean;
}

const ProductFeatures = ({ freeShipping, warrantyMonths, returnAvailable }: ProductFeaturesProps) => {
  const features = [
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Free Shipping",
      show: freeShipping
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: warrantyMonths ? `${warrantyMonths}-Month Warranty` : "Warranty",
      show: warrantyMonths && warrantyMonths > 0
    },
    {
      icon: <RotateCcw className="w-5 h-5" />,
      title: "Easy Returns",
      show: returnAvailable
    }
  ];

  const visibleFeatures = features.filter(f => f.show);

  if (visibleFeatures.length === 0) return null;

  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-3 gap-3">
        {visibleFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center text-center"
          >
            <div className="text-orange-600 mb-1">
              {feature.icon}
            </div>
            <p className="text-xs font-medium text-gray-700 leading-tight">
              {feature.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFeatures;