"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import BottomNav from "@/components/layout/BottomNav";

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrderId = searchParams.get("success");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen dotted-background flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (successOrderId) {
    return (
      <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
        <div className="rounded-2xl bg-white p-6 shadow-md text-center max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful</h1>
          <p className="text-gray-600 mb-4">
            Your order has been placed. Order ID: {successOrderId.slice(0, 8)}…
          </p>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
            <Link href="/cart" className="block">
              <Button variant="secondary" fullWidth>
                View Cart
              </Button>
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="rounded-2xl bg-white p-6 shadow-md text-center">
        <p className="text-gray-600 mb-4">No orders yet.</p>
        <Button variant="primary" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
