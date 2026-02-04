"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import BottomNav from "@/components/layout/BottomNav";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name?: string;
      description?: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      prefill?: { email?: string; name?: string };
    }) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in?callbackUrl=/checkout");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) return;
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const openRazorpay = useCallback(
    (orderId: string, razorpayOrderId: string, amount: number, currency: string) => {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId || !window.Razorpay) {
        setError("Payment is not available. Please refresh and try again.");
        return;
      }
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Eena Pins",
        description: "Order payment",
        handler: async (response) => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(data.message ?? "Payment verification failed");
              return;
            }
            clearCart();
            router.push(`/orders?success=${orderId}`);
          } catch {
            setError("Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: session?.user?.email
          ? { email: session.user.email, name: session.user.name ?? undefined }
          : undefined,
      });
      rzp.open();
    },
    [clearCart, router, session?.user?.email, session?.user?.name]
  );

  const handleProceedToPay = async () => {
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to create order");
        setLoading(false);
        return;
      }
      openRazorpay(
        data.orderId,
        data.razorpayOrderId,
        data.amount,
        data.currency ?? "INR"
      );
    } catch {
      setError("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen dotted-background flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
        <div className="rounded-2xl bg-white p-6 shadow-md text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const totalPaise = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalRupees = (totalPaise / 100).toFixed(2);

  return (
    <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="rounded-2xl bg-white p-6 shadow-md mb-6">
        <p className="text-sm text-gray-600 mb-2">
          {cartItems.length} item(s) · Total
        </p>
        <p className="text-xl font-bold text-gray-900 mb-4">₹{totalRupees}</p>
        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <Button
          variant="primary"
          fullWidth
          onClick={handleProceedToPay}
          disabled={loading || !scriptLoaded}
        >
          {loading ? "Please wait..." : scriptLoaded ? "Pay ₹" + totalRupees : "Loading..."}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You will be redirected to Razorpay to complete the payment securely.
      </p>

      <BottomNav />
    </div>
  );
}
