"use client";

import { MapPin, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

type ApiAddress = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  label?: string | null;
  isDefault: boolean;
};

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    label: "",
    isDefault: false,
  });

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      if (res.ok) setAddresses(data);
      else setError(data?.message || "Failed to load addresses");
    } catch (e) {
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !form.fullName ||
      !form.phone ||
      !form.street ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        // Edit existing
        const res = await fetch(`/api/addresses/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === data.id ? data : a)),
          );
          setEditId(null);
          setShowForm(false);
        } else {
          setError(data?.message || "Failed to update address");
        }
      } else {
        // Create new
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setAddresses((prev) => [data, ...prev]);
          setForm({
            fullName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            label: "",
            isDefault: false,
          });
          setShowForm(false);
        } else {
          setError(data?.message || "Failed to add address");
        }
      }
    } catch (e) {
      setError(editId ? "Failed to update address" : "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
      else setError(data?.message || "Failed to delete");
    } catch (e) {
      setError("Failed to delete address");
    }
  };

  const handleToggleDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === data.id ? data : { ...a, isDefault: false },
          ),
        );
        fetchAddresses();
      } else setError(data?.message || "Failed to update");
    } catch (e) {
      setError("Failed to update address");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
            Saved Addresses
          </h1>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-[#1F3D2B] px-4 py-2 text-sm font-medium text-white transition active:scale-95"
          >
            + Add Address
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Address List */}
        {loading ? (
          <div className="text-sm text-neutral-500">Loading addresses…</div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EFEA]">
                    <MapPin className="h-5 w-5 text-neutral-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-900">
                        {address.label || address.fullName}
                      </p>

                      {address.isDefault && (
                        <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500">
                      {address.fullName}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleDefault(address.id)}
                    className="text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    {address.isDefault ? "Default" : "Make Default"}
                  </button>
                  <button
                    onClick={() => {
                      setEditId(address.id);
                      setForm({
                        fullName: address.fullName,
                        phone: address.phone,
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        label: address.label || "",
                        isDefault: address.isDefault,
                      });
                      setShowForm(true);
                    }}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="mt-3 space-y-1 text-sm text-neutral-600">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p>Phone: +91 {address.phone}</p>
              </div>
            </div>
          ))
        )}

        {/* Add / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6">
              <h2 className="mb-3 text-lg font-medium">Add Address</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-600">Full name</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-600">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-600">Street</label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neutral-600">City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600">State</label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600">Pincode</label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-600">
                    Label (Home / Work)
                  </label>
                  <input
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm text-neutral-600"
                  >
                    Make default
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-[#1F3D2B] px-4 py-2 text-sm font-medium text-white"
                  >
                    {saving ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
