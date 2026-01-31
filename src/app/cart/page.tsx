'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import CartHeader from '@/components/cart/CartHeader';
import EmptyCart from '@/components/cart/EmptyCart';
import CartItemCard from '@/components/cart/CartItemCard';
import OrderSummary from '@/components/cart/OrderSummary';
import CartActions from '@/components/cart/CartActions';
import CartBanner from '@/components/cart/CartBanner';
import BottomNav from '@/components/layout/BottomNav';

export default function CartPage() {
  const { cartItems, getCartCount } = useCart();
  const itemCount = getCartCount();

  return (
    <div className="min-h-screen dotted-background">
      <CartHeader />

      <main className="pt-16 pb-28 px-4">
  {/* Page Title */}
  <div className="flex items-center gap-2 mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart🛒</h1>
  </div>

  <p className="text-sm text-gray-600 mb-6">
    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
  </p>

  {/* Empty Cart Message */}
  {cartItems.length === 0 && <EmptyCart />}

  {/* Cart Items */}
  {cartItems.length > 0 && (
    <div className="space-y-4 mb-6">
      {cartItems.map((item) => (
        <CartItemCard key={item.product.id} item={item} />
      ))}
    </div>
  )}

  {/* Order Summary - ALWAYS show */}
  <OrderSummary />

  {/* Optional Actions & Banners */}
  {cartItems.length > 0 && <CartActions />}
  {cartItems.length > 0 && <CartBanner />}

 

</main>


      <BottomNav />
    </div>
  );
}