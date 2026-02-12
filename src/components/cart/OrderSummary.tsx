"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { formatInrFromPaise } from "@/lib/currency";

const SHIPPING_COST_PAISE = 2500; // ₹25
const FREE_SHIPPING_THRESHOLD_PAISE = 50000; // ₹500

const OrderSummary = () => {
  const { getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD_PAISE
        ? 0
        : SHIPPING_COST_PAISE;
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        Order Summary 📋
      </h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {formatInrFromPaise(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold text-gray-900">
            {shipping === 0 ? "FREE" : formatInrFromPaise(shipping)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Total */}
        <div className="flex justify-between text-base">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">
            {formatInrFromPaise(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
