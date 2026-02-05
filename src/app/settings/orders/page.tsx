"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Truck, Clock } from "lucide-react";
import Link from "next/link";

type ApiOrder = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; imageUrl: string };
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
  { label: string; icon: any; badge: string }
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

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok) setOrders(data);
        else setError(data?.message || "Failed to load orders");
      } catch (e) {
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

                  <div className="flex justify-between pt-2 text-xs font-medium">
                    <Link
                      href={`/settings/orders/${order.id}`}
                      className="text-neutral-600 hover:text-neutral-800"
                    >
                      View Details
                    </Link>
                    {order.status === "DELIVERED" && (
                      <button className="text-neutral-600 hover:text-neutral-800">
                        Write a Review
                      </button>
                    )}
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
