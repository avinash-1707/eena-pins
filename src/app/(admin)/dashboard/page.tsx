"use client";

import React, { useEffect, useState } from "react";

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

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
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
                                {/* Left: Name + Username */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-gray-900">
                                        {user.name || "—"}
                                    </p>
                                    <p className="truncate text-sm text-gray-500">
                                        @{user.username}
                                    </p>
                                </div>

                                {/* Middle: Phone */}
                                <div className="flex shrink-0 items-center justify-center">
                                    <p className="text-sm text-gray-600">
                                        {user.phone || "—"}
                                    </p>
                                </div>

                                {/* Right: Role badge */}
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
            </main>
        </div>
    );
}
