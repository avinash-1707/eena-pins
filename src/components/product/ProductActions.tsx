'use client';

import React, { useState } from 'react';
import { ShoppingCart, Pin, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Product } from '@/types/Preduct';
import { useCart } from '@/context/CartContext';
import CollectionPickerModal from '@/components/collections/CollectionPickerModal';

interface ProductActionsProps {
  product: Product;
  initiallyPinned?: boolean;
  // price: number;
}

const ProductActions = ({ product, initiallyPinned = false }: ProductActionsProps) => {
  const { addToCart } = useCart();

  const [isPinned, setIsPinned] = useState(initiallyPinned);
  const [isAdded, setIsAdded] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const handleAddToCart = () => {
    
      // addToCart({ id: productId, price } as Product, 1);
      addToCart(product, 1);
    setIsAdded(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleOpenPinModal = () => {
    setShowCollectionModal(true);
  };

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          fullWidth
          onClick={handleAddToCart}
          icon={isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        >
          {isAdded ? 'Added to Cart' : 'Add to Cart'}
        </Button>

        <button
          onClick={handleOpenPinModal}
          className="p-3 rounded-full border-2 border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Save to collection"
        >
          <Pin
            className={`w-6 h-6 transition-colors ${
              isPinned ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      <CollectionPickerModal
        open={showCollectionModal}
        productId={product.id}
        onClose={() => setShowCollectionModal(false)}
        onPinned={() => setIsPinned(true)}
      />
    </div>
  );
};

export default ProductActions;
