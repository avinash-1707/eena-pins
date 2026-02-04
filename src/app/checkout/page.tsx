"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import BottomNav from "@/components/layout/BottomNav";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  label?: string;
  isDefault: boolean;
}

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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    label: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in?callbackUrl=/checkout");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) return;
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
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

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status !== "authenticated") return;
      setLoadingAddresses(true);
      try {
        const res = await fetch("/api/addresses");
        const data = await res.json();
        if (res.ok) {
          setAddresses(data);
          const defaultAddr = data.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedShippingId(defaultAddr.id);
          } else if (data.length > 0) {
            setSelectedShippingId(data[0].id);
          }
        }
      } catch {
        setError("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [status]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses([data, ...addresses]);
        setSelectedShippingId(data.id);
        setNewAddress({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          label: "",
        });
        setShowAddressForm(false);
        setError(null);
      } else {
        setError(data.message || "Failed to add address");
      }
    } catch {
      setError("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const openRazorpay = useCallback(
    (
      orderId: string,
      razorpayOrderId: string,
      amount: number,
      currency: string,
    ) => {
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
    [clearCart, router, session?.user?.email, session?.user?.name],
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
        body: JSON.stringify({
          items,
          shippingAddressId: selectedShippingId,
          billingAddressId: useShippingAsBilling
            ? undefined
            : selectedBillingId,
          useShippingAsBilling,
        }),
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
        data.currency ?? "INR",
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
    0,
  );
  const totalRupees = (totalPaise / 100).toFixed(2);

  if (loadingAddresses && addresses.length === 0) {
    return (
      <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
        <p className="text-gray-600 text-center">Loading addresses...</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen dotted-background pt-16 pb-28 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Shipping Address Section */}
      <div className="rounded-2xl bg-white p-6 shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Address
        </h2>

        {addresses.length > 0 ? (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="shipping"
                  value={addr.id}
                  checked={selectedShippingId === addr.id}
                  onChange={(e) => setSelectedShippingId(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {addr.fullName}
                    {addr.label && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({addr.label})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{addr.street}</p>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-600">{addr.phone}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No saved addresses yet.</p>
        )}

        {!showAddressForm ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowAddressForm(true)}
          >
            + Add New Address
          </Button>
        ) : (
          <form
            onSubmit={handleAddNewAddress}
            className="space-y-3 border-t pt-4"
          >
            <input
              type="text"
              placeholder="Full Name"
              value={newAddress.fullName}
              onChange={(e) =>
                setNewAddress({ ...newAddress, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="tel"
              placeholder="Phone (10 digits)"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Street Address"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Pincode (6 digits)"
              value={newAddress.pincode}
              onChange={(e) =>
                setNewAddress({ ...newAddress, pincode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Label (Home, Work, etc.) - Optional"
              value={newAddress.label}
              onChange={(e) =>
                setNewAddress({ ...newAddress, label: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <Button variant="primary" fullWidth disabled={loading}>
                Save Address
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Billing Address Section */}
      <div className="rounded-2xl bg-white p-6 shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Billing Address
        </h2>

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={useShippingAsBilling}
            onChange={(e) => setUseShippingAsBilling(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">
            Use shipping address as billing address
          </span>
        </label>

        {!useShippingAsBilling && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="billing"
                  value={addr.id}
                  checked={selectedBillingId === addr.id}
                  onChange={(e) => setSelectedBillingId(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {addr.fullName}
                    {addr.label && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({addr.label})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{addr.street}</p>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary & Payment */}
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
          disabled={loading || !scriptLoaded || !selectedShippingId}
        >
          {loading
            ? "Please wait..."
            : scriptLoaded
              ? "Pay ₹" + totalRupees
              : "Loading..."}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You will be redirected to Razorpay to complete the payment securely.
      </p>

      <BottomNav />
    </div>
  );
}
