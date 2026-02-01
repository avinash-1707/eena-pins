"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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

type Tab = "users" | "requests";

export default function Dashboard() {
    const [tab, setTab] = useState<Tab>("users");
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<BrandRequestWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [requestsError, setRequestsError] = useState<string | null>(null);

    async function fetchData() {
        setLoading(true);
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
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
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

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tab === "requests") {
            fetchRequests();
        }
    }, [tab]);

    async function handleApprove(id: string) {
        setActioningId(id);
        try {
            const res = await fetch(
                `/api/admin/brand-requests/${id}/approve`,
                { method: "POST" }
            );
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
            const res = await fetch(
                `/api/admin/brand-requests/${id}/reject`,
                { method: "POST" }
            );
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
                                        <div className="flex shrink-0">
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
            </main>
        </div>
    );
}
