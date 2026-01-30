'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  imageHeight?: 'short' | 'medium' | 'tall';
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  // Height pattern to ensure adjacent cards are different
  const heightPattern: ('short' | 'medium' | 'tall')[] = [
    'tall', 'short', 'medium', 'tall', 'medium', 'short',
    'short', 'tall', 'medium', 'short', 'tall', 'medium'
  ];

  return (
    <div className="px-4 py-6">
      {/* Masonry Grid */}
      <div className="columns-2 gap-4 space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="break-inside-avoid mb-4">
            <ProductCard
              id={product.id}
              name={product.name}
              category={product.category}
              imageUrl={product.imageUrl}
              imageHeight={product.imageHeight || heightPattern[index % heightPattern.length]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;