"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface BrandProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    description: string;
    createdAt: string;
    avgRating: number | null;
    ratingCount: number;
}

interface BrandDashboardData {
    productCount: number;
    totalPayout: number;
    products: BrandProduct[];
}

function formatPayout(paise: number) {
    return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function BrandDashboardPage() {
    const [data, setData] = useState<BrandDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/brand/dashboard");
                if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    throw new Error(json.message ?? "Failed to load dashboard");
                }
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
                    <div className="animate-pulse space-y-6">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            <div className="h-24 rounded-xl bg-gray-200 sm:h-28" />
                            <div className="h-24 rounded-xl bg-gray-200 sm:h-28" />
                        </div>
                        <div className="h-12 w-40 rounded-lg bg-gray-200" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-24 rounded-xl bg-gray-200 sm:h-28" />
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

    const productCount = data?.productCount ?? 0;
    const totalPayout = data?.totalPayout ?? 0;
    const products = data?.products ?? [];

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
                {/* Stats: product count & payout */}
                <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                        <p className="text-sm font-medium text-gray-500">Products</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                            {productCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                        <p className="text-sm font-medium text-gray-500">Total payout</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-700 sm:text-3xl">
                            {formatPayout(totalPayout)}
                        </p>
                    </div>
                </section>

                {/* Create product CTA */}
                <div className="mb-6">
                    <Link
                        href="/brand-dashboard/products/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 active:scale-[0.98] sm:px-5 sm:py-3"
                    >
                        <span className="text-lg leading-none" aria-hidden>+</span>
                        Create product
                    </Link>
                </div>

                {/* Products list header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                        Your products
                    </h2>
                </div>

                {/* Products list */}
                <section className="space-y-3 sm:space-y-4">
                    {products.length === 0 ? (
                        <div className="rounded-xl border border-gray-100 bg-white py-12 text-center shadow-sm">
                            <p className="text-gray-500">No products yet.</p>
                            <Link
                                href="/brand-dashboard/products/new"
                                className="mt-3 inline-block text-sm font-medium text-gray-900 underline hover:no-underline"
                            >
                                Create your first product
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-3 sm:space-y-4">
                            {products.map((p) => (
                                <li key={p.id}>
                                    <Link
                                        href={`/product/${p.id}`}
                                        className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-4"
                                    >
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.imageUrl}
                                                alt={p.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-medium text-gray-900 sm:text-lg">
                                                {p.name}
                                            </h3>
                                            <p className="mt-0.5 text-sm text-gray-500">
                                                {p.category}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatPayout(p.price)}
                                            </p>
                                            {p.avgRating != null && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    ★ {p.avgRating.toFixed(1)} ({p.ratingCount}{" "}
                                                    {p.ratingCount === 1 ? "review" : "reviews"})
                                                </p>
                                            )}
                                        </div>
                                        <span className="self-center text-gray-400 sm:block" aria-hidden>
                                            →
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}
