"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Truck, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type ItemRating = {
  id: string;
  rating: number;
  review: string | null;
};

type ApiOrder = {
  id: string;
  status: string;
  canRateProducts: boolean;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; imageUrl: string; myRating: ItemRating | null };
  }>;
  payment?: { status?: string; amount?: number } | null;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
};

const statusConfig: Record<
  string,
  { label: string; icon: LucideIcon; badge: string }
> = {
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-[#E6F4EA] text-[#2E7D32]",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    badge: "bg-[#E8F0FE] text-[#1A73E8]",
  },
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    badge: "bg-[#FFF4E5] text-[#B26A00]",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    badge: "bg-[#E8F0FE] text-[#1A73E8]",
  },
  CREATED: {
    label: "Created",
    icon: Clock,
    badge: "bg-[#FFF4E5] text-[#B26A00]",
  },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRatingKey, setActiveRatingKey] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewValue, setReviewValue] = useState("");
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openRatingForm = (orderId: string, productId: string, existing: ItemRating | null) => {
    const formKey = `${orderId}:${productId}`;
    setActiveRatingKey(formKey);
    setSelectedOrderId(orderId);
    setSelectedProductId(productId);
    setRatingValue(existing?.rating ?? 5);
    setReviewValue(existing?.review ?? "");
    setActionError(null);
    setActionMessage(null);
  };

  const closeRatingForm = () => {
    setActiveRatingKey(null);
    setSelectedOrderId(null);
    setSelectedProductId(null);
    setActionError(null);
    setActionMessage(null);
  };

  const saveRating = async () => {
    if (!selectedOrderId || !selectedProductId) return;
    const formKey = `${selectedOrderId}:${selectedProductId}`;
    setSubmittingKey(formKey);
    setActionError(null);
    setActionMessage(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          productId: selectedProductId,
          rating: ratingValue,
          review: reviewValue.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data?.message || "Failed to save rating");
        return;
      }

      const saved = data?.rating as ItemRating;

      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== selectedOrderId) return order;
          return {
            ...order,
            items: order.items.map((item) =>
              item.product.id === selectedProductId
                ? {
                    ...item,
                    product: {
                      ...item.product,
                      myRating: saved,
                    },
                  }
                : item,
            ),
          };
        }),
      );
      setActionMessage("Rating saved successfully.");
      setActiveRatingKey(null);
    } catch {
      setActionError("Failed to save rating");
    } finally {
      setSubmittingKey(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok) setOrders(data);
        else setError(data?.message || "Failed to load orders");
      } catch {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">
        {/* Page Title */}
        <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          Order History
        </h1>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Orders */}
        {loading ? (
          <div className="text-sm text-neutral-500">Loading orders…</div>
        ) : (
          orders.map((order) => {
            const statusKey = (order.status || "").toUpperCase();
            const cfg = statusConfig[statusKey] ?? statusConfig.CREATED;
            const StatusIcon = cfg.icon;
            const product = order.items?.[0]?.product;
            const image = product?.imageUrl || "/images/placeholder.png";
            const productName = product?.name || "Order";
            const total = order.totalAmount
              ? `₹${(order.totalAmount / 100).toLocaleString()}`
              : order.payment?.amount
                ? `₹${(order.payment.amount / 100).toLocaleString()}`
                : "—";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <img
                  src={image}
                  alt={productName}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {productName}
                    </p>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-600">
                    <p>Order ID: {order.id}</p>
                    <p>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Items:{" "}
                      {order.items?.reduce((s, it) => s + it.quantity, 0) ?? 0}
                    </p>
                    <p>Total: {total}</p>
                    {order.status === "DELIVERED" && order.shippingAddress && (
                      <p>
                        Delivery: {order.shippingAddress.street},{" "}
                        {order.shippingAddress.city}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    {order.items.map((item) => {
                      const ratingKey = `${order.id}:${item.product.id}`;
                      const isOpen = activeRatingKey === ratingKey;
                      const isSubmitting = submittingKey === ratingKey;

                      return (
                        <div key={item.id} className="rounded-lg border border-neutral-200 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-neutral-700">
                              <p className="font-medium text-neutral-900">
                                {item.product.name}
                              </p>
                              <p>
                                Qty: {item.quantity} • ₹
                                {(item.price / 100).toLocaleString()}
                              </p>
                            </div>
                            {order.canRateProducts && (
                              <button
                                type="button"
                                className="text-xs text-neutral-700 hover:text-neutral-900"
                                onClick={() =>
                                  openRatingForm(order.id, item.product.id, item.product.myRating)
                                }
                              >
                                {item.product.myRating ? "Edit rating" : "Rate product"}
                              </button>
                            )}
                          </div>

                          {item.product.myRating && !isOpen && (
                            <p className="mt-1 text-xs text-neutral-500">
                              Your rating: {item.product.myRating.rating}/5
                            </p>
                          )}

                          {isOpen && (
                            <div className="mt-3 space-y-2">
                              <label className="block text-xs text-neutral-700">
                                Rating
                              </label>
                              <select
                                value={ratingValue}
                                onChange={(e) => setRatingValue(Number(e.target.value))}
                                className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs"
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>
                                    {v} / 5
                                  </option>
                                ))}
                              </select>

                              <label className="block text-xs text-neutral-700">
                                Review (optional)
                              </label>
                              <textarea
                                value={reviewValue}
                                onChange={(e) => setReviewValue(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs"
                                maxLength={1000}
                              />

                              {actionError && (
                                <p className="text-xs text-red-600">{actionError}</p>
                              )}

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-xs text-neutral-600"
                                  onClick={closeRatingForm}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white disabled:opacity-60"
                                  onClick={saveRating}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {actionMessage && (
                    <p className="text-xs text-green-700">{actionMessage}</p>
                  )}

                  <div className="flex justify-between pt-2 text-xs font-medium">
                    <Link
                      href={`/settings/orders/${order.id}`}
                      className="text-neutral-600 hover:text-neutral-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
