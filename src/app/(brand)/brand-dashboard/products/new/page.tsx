"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [freeShippingOn, setFreeShippingOn] = useState(false);
  const [returnAvailable, setReturnAvailable] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image (JPEG, PNG, WebP or GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? "Upload failed");
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setImagePreview(null);
      setImageUrl("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function clearImage() {
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = priceRupees ? Math.round(parseFloat(priceRupees) * 100) : 0;
    if (
      !name.trim() ||
      price < 0 ||
      !category.trim() ||
      !description.trim() ||
      !imageUrl.trim()
    ) {
      setError("Please fill all fields and upload a product image.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price,
          imageUrl: imageUrl.trim(),
          category: category.trim(),
          description: description.trim(),
          freeShippingOn,
          returnAvailable,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to create product");
      }
      router.push("/brand-dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-6">
          <Link
            href="/brand-dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl">
          Create product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price (₹)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product image
            </label>
            <p className="mt-0.5 text-xs text-gray-500">
              JPEG, PNG, WebP or GIF, max 5 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={uploading}
              className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-60"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-500">Uploading…</p>
            )}
            {imagePreview && (
              <div className="mt-3 flex items-start gap-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-green-600">Image uploaded</span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm"
              required
            />
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={freeShippingOn}
                onChange={(e) => setFreeShippingOn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700">Free shipping</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={returnAvailable}
                onChange={(e) => setReturnAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700">Return available</span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/brand-dashboard"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
