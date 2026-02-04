"use client";

import React, { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  commission: number;
  brandAmount: number;
}

interface BrandOrder {
  id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  createdAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
}

interface BrandOrdersData {
  orders: BrandOrder[];
  totalEarnings: number;
}

interface PayoutsData {
  orders: BrandOrder[];
  totalEarnings: number;
}

function formatPayout(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

export default function BrandPayoutPage() {
  const [data, setData] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/brand/orders");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message ?? "Failed to load orders");
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-24 rounded-xl bg-gray-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const orders = data?.orders ?? [];
  const totalEarnings = data?.totalEarnings ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <h1 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl">
          Order history
        </h1>

        {/* Total earnings summary */}
        <section className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">Total earnings</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 sm:text-3xl">
            {formatPayout(data?.totalEarnings ?? 0)}
          </p>
        </section>

        {/* Order list */}
        <section className="space-y-3 sm:space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white py-12 text-center shadow-sm">
              <p className="text-gray-500">No orders yet.</p>
              <p className="mt-1 text-sm text-gray-400">
                Orders will appear here when customers purchase your products.
              </p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {formatPayout(
                          o.items.reduce((sum, item) => sum + item.price, 0),
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""} ·{" "}
                        {formatDate(o.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Commission: {formatPayout(o.platformFee)}
                      </p>
                    </div>
                    {statusBadge(o.status)}
                  </div>
                  {o.deliveredAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Delivered {formatDate(o.deliveredAt)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
