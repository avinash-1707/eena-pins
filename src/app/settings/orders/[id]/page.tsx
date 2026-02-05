"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Truck, Clock } from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (res.ok) setOrder(data);
        else setError(data?.message || "Failed to load order");
      } catch (e) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (!id) return <div className="p-6">Order id missing</div>;

  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md sm:max-w-3xl">
        <button
          className="mb-4 text-sm text-neutral-600 hover:underline"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        {loading && (
          <div className="text-sm text-neutral-500">Loading order…</div>
        )}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
              <img
                src={
                  order.items?.[0]?.product?.imageUrl ||
                  "/images/placeholder.png"
                }
                alt={order.items?.[0]?.product?.name || "Order"}
                className="h-56 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-neutral-900">
                    {order.items?.[0]?.product?.name || "Order"}
                  </h2>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "DELIVERED" ? "bg-[#E6F4EA] text-[#2E7D32]" : order.status === "SHIPPED" ? "bg-[#E8F0FE] text-[#1A73E8]" : "bg-[#FFF4E5] text-[#B26A00]"}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-neutral-600">
                  <p>Order ID: {order.id}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                  <p>
                    Total:{" "}
                    {order.totalAmount
                      ? `₹${(order.totalAmount / 100).toLocaleString()}`
                      : order.payment?.amount
                        ? `₹${(order.payment.amount / 100).toLocaleString()}`
                        : "—"}
                  </p>
                  <p>Payment: {order.payment?.status ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-medium text-neutral-900">
                Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <img
                      src={it.product?.imageUrl || "/images/placeholder.png"}
                      alt={it.product?.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-neutral-900">
                        {it.product?.name}
                      </div>
                      <div className="text-xs text-neutral-600">
                        Qty: {it.quantity} • ₹
                        {(it.price / 100).toLocaleString()}
                      </div>
                      {it.brandProfile?.brandName && (
                        <div className="text-xs text-neutral-500">
                          Brand: {it.brandProfile.brandName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-900">
                  Shipping Address
                </h3>
                {order.shippingAddress ? (
                  <div className="text-sm text-neutral-600">
                    {order.shippingAddress.fullName && (
                      <p>{order.shippingAddress.fullName}</p>
                    )}
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    {order.shippingAddress.phone && (
                      <p>Phone: +91 {order.shippingAddress.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">—</p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-900">
                  Billing Address
                </h3>
                {order.billingAddress ? (
                  <div className="text-sm text-neutral-600">
                    {order.billingAddress.fullName && (
                      <p>{order.billingAddress.fullName}</p>
                    )}
                    <p>{order.billingAddress.street}</p>
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state}{" "}
                      - {order.billingAddress.pincode}
                    </p>
                    {order.billingAddress.phone && (
                      <p>Phone: +91 {order.billingAddress.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">—</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
