'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  isPinned?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onPinRequest?: (productId: string) => void;
}

const ProductGrid = ({ products, onPinRequest }: ProductGridProps) => {
  return (
    <div className="px-4 py-6">
      {/* Masonry Grid */}
      <div className="columns-2 gap-4 space-y-4">
        {products.map((product) => (
          <div key={product.id} className="break-inside-avoid mb-4">
            <ProductCard
              id={product.id}
              name={product.name}
              category={product.category}
              imageUrl={product.imageUrl}
              isPinned={product.isPinned}
              onPinRequest={onPinRequest}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
