"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const PRODUCTS_PAGE_SIZE = 20;

interface Stats {
  users: number;
  brands: number;
}

interface User {
  id: string;
  name: string | null;
  username: string;
  phone: string | null;
  role: "USER" | "BRAND" | "ADMIN";
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  brandProfile?: {
    id: string;
    user?: { username: string; avatarUrl: string | null };
  } | null;
}

interface BrandRequestWithUser {
  id: string;
  userId: string;
  status: string;
  message: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    createdAt: string;
  };
}

type Tab = "users" | "requests" | "products";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("users");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<BrandRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [actioningProductId, setActioningProductId] = useState<string | null>(
    null,
  );
  const [productsFetched, setProductsFetched] = useState(false);
  const [productsNextCursor, setProductsNextCursor] = useState<string | null>(
    null,
  );
  const [productsHasMore, setProductsHasMore] = useState(true);
  const [productsLoadingMore, setProductsLoadingMore] = useState(false);
  const productsSentinelRef = useRef<HTMLDivElement>(null);

  async function fetchData() {
    setLoading(true);
    setUsersError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/users"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data ?? []);
      } else {
        const data = await usersRes.json().catch(() => ({}));
        setUsersError(data.message ?? "Failed to load users");
        // FIXED: Don't clear users array on error, let the UI show the error
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setUsersError("Failed to load users");
      // FIXED: Don't clear users array on error
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests() {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const res = await fetch("/api/admin/brand-requests");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRequestsError(data.message ?? "Failed to load requests");
        setRequests([]);
        return;
      }
      const data = await res.json();
      setRequests(data);
    } catch {
      setRequestsError("Failed to load requests");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }

  const loadProductsPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      const params = new URLSearchParams();
      params.set("limit", String(PRODUCTS_PAGE_SIZE));
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProductsError(data.message ?? "Failed to load products");
        if (!append) setProducts([]);
        setProductsFetched(true);
        return;
      }
      const list = data.data ?? [];
      const next = data.nextCursor ?? null;
      const hasMore = data.hasMore ?? false;
      if (append) {
        setProducts((prev) => [...prev, ...list]);
      } else {
        setProducts(list);
      }
      setProductsNextCursor(next);
      setProductsHasMore(hasMore);
      setProductsFetched(true);
    },
    []
  );

  async function fetchProducts() {
    setProductsLoading(true);
    setProductsError(null);
    try {
      await loadProductsPage(null, false);
    } catch {
      setProductsError("Failed to load products");
      setProducts([]);
      setProductsFetched(true);
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === "requests") {
      fetchRequests();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "products" && !productsFetched && !productsLoading) {
      fetchProducts();
    }
  }, [tab, productsFetched, productsLoading]);

  useEffect(() => {
    if (
      tab !== "products" ||
      !productsHasMore ||
      productsLoadingMore ||
      !productsNextCursor
    ) {
      return;
    }
    const el = productsSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setProductsLoadingMore(true);
        loadProductsPage(productsNextCursor, true).finally(() =>
          setProductsLoadingMore(false)
        );
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    tab,
    productsHasMore,
    productsLoadingMore,
    productsNextCursor,
    loadProductsPage,
  ]);

  async function handleDeleteUser(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingUserId(id);
    setUsersError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUsersError(
          data.message ?? "Failed to delete user. Please try again.",
        );
        return;
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch {
      setUsersError("Failed to delete user. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  }

  async function handleDeleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    );
    if (!confirmed) return;

    setActioningProductId(id);
    setProductsError(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProductsError(
          data.message ?? "Failed to delete product. Please try again.",
        );
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch {
      setProductsError("Failed to delete product. Please try again.");
    } finally {
      setActioningProductId(null);
    }
  }

  async function handleApprove(id: string) {
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/brand-requests/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRequestsError(data.message ?? "Failed to approve");
        return;
      }
      await fetchRequests();
      await fetchData();
    } catch {
      setRequestsError("Failed to approve");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/brand-requests/${id}/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRequestsError(data.message ?? "Failed to reject");
        return;
      }
      await fetchRequests();
    } catch {
      setRequestsError("Failed to reject");
    } finally {
      setActioningId(null);
    }
  }

  if (loading && tab === "users") {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === "users"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={() => setTab("requests")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === "requests"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Requests
          </button>
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === "products"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Products
          </button>
        </div>

        {tab === "users" && (
          <>
            {/* Stats cards */}
            <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {stats?.users ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Brands</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {stats?.brands ?? 0}
                </p>
              </div>
            </section>

            {/* Users list header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <button
                onClick={() => fetchData()}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:scale-[0.98]"
              >
                Refresh
              </button>
            </div>

            {usersError && (
              <p className="mb-3 text-sm text-red-600">{usersError}</p>
            )}

            {/* Users list */}
            <section className="space-y-2">
              {users.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
                  <p className="text-gray-500">No users yet</p>
                </div>
              ) : (
                users.map((user) => (
                  <article
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">
                        {user.name || "—"}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-center">
                      <p className="text-sm text-gray-600">
                        {user.phone || "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "BRAND"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.role !== "ADMIN" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUserId === user.id}
                          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete user"
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}

        {tab === "requests" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Brand requests
              </h2>
              <button
                onClick={() => fetchRequests()}
                disabled={requestsLoading}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {requestsError && (
              <p className="mb-4 text-sm text-red-600">{requestsError}</p>
            )}

            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
                <p className="text-gray-500">No pending requests</p>
              </div>
            ) : (
              <section className="space-y-2">
                {requests.map((req) => (
                  <article
                    key={req.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">
                          {req.user.name || "—"}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{req.user.username}
                        </p>
                        {(req.user.email || req.user.phone) && (
                          <p className="mt-1 text-xs text-gray-500">
                            {req.user.email ?? req.user.phone ?? ""}
                          </p>
                        )}
                        {req.message && (
                          <p className="mt-2 text-sm text-gray-600">
                            {req.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          disabled={actioningId === req.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {actioningId === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Allow
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.id)}
                          disabled={actioningId === req.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actioningId === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {tab === "products" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <button
                onClick={() => fetchProducts()}
                disabled={productsLoading}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {productsError && (
              <p className="mb-4 text-sm text-red-600">{productsError}</p>
            )}

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
                <p className="text-gray-500">No products yet</p>
              </div>
            ) : (
              <>
                <section className="space-y-2">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {product.category}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          ₹{(product.price / 100).toFixed(2)}{" "}
                          {product.brandProfile?.user?.username
                            ? `· @${product.brandProfile.user.username}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(product.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={actioningProductId === product.id}
                          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actioningProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </section>
                <div
                  ref={productsSentinelRef}
                  className="h-4"
                  aria-hidden
                />
                {productsLoadingMore && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
