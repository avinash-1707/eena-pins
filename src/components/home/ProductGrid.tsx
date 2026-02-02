'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;