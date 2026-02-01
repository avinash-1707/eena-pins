"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Building2,
    FileText,
    Calendar,
    Mail,
    Phone,
    Package,
    Wallet,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface BrandProfileData {
    id: string;
    brandName: string;
    logoUrl: string | null;
    description: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    businessType: string | null;
    isApproved: boolean;
    payoutEnabled: boolean;
    createdAt: string;
    user: {
        username: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: string;
    };
    productCount: number;
    payoutCount: number;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function maskContact(value: string | null): string {
    if (!value) return "—";
    if (value.includes("@")) {
        const [local, domain] = value.split("@");
        if (local.length <= 2) return value;
        return `${local.slice(0, 2)}***@${domain}`;
    }
    if (value.length <= 4) return "••••";
    return "••••" + value.slice(-4);
}

export default function BrandProfilePage() {
    const [profile, setProfile] = useState<BrandProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/brand/profile");
                if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    throw new Error(json.message ?? "Failed to load profile");
                }
                const json = await res.json();
                setProfile(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading brand profile…
                    </p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm max-w-md">
                    <p className="text-red-600 font-medium">
                        {error ?? "Profile not found"}
                    </p>
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

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-md px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
                <h1 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl">
                    Brand profile
                </h1>

                {/* Header with logo and name */}
                <header className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                            {profile.logoUrl ? (
                                <Image
                                    src={profile.logoUrl}
                                    alt={profile.brandName}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Building2 className="h-8 w-8 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {profile.brandName}
                            </h2>
                            <p className="text-sm text-gray-500">
                                @{profile.user.username}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        profile.isApproved
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-amber-100 text-amber-800"
                                    }`}
                                >
                                    {profile.isApproved ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <XCircle className="h-3 w-3" />
                                    )}
                                    {profile.isApproved ? "Approved" : "Pending"}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        profile.payoutEnabled
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <Wallet className="h-3 w-3" />
                                    {profile.payoutEnabled
                                        ? "Payout enabled"
                                        : "Payout disabled"}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Description */}
                {profile.description && (
                    <section className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">About</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            {profile.description}
                        </p>
                    </section>
                )}

                {/* Stats */}
                <section className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                {profile.productCount}
                            </p>
                            <p className="text-xs text-gray-500">Products</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Wallet className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                {profile.payoutCount}
                            </p>
                            <p className="text-xs text-gray-500">Payouts</p>
                        </div>
                    </div>
                </section>

                {/* Contact & compliance */}
                <section className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
                        <span className="text-gray-500">Joined</span>
                        <span className="font-medium text-gray-900">
                            {formatDate(profile.createdAt)}
                        </span>
                    </div>
                    {profile.user.email && (
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">
                                {maskContact(profile.user.email)}
                            </span>
                        </div>
                    )}
                    {profile.user.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-900">
                                {maskContact(profile.user.phone)}
                            </span>
                        </div>
                    )}
                    {profile.gstNumber && (
                        <div className="flex items-center gap-3 text-sm">
                            <FileText className="h-4 w-4 shrink-0 text-gray-500" />
                            <span className="text-gray-500">GST</span>
                            <span className="font-medium text-gray-900">
                                {profile.gstNumber}
                            </span>
                        </div>
                    )}
                    {profile.businessType && (
                        <div className="flex items-center gap-3 text-sm">
                            <Building2 className="h-4 w-4 shrink-0 text-gray-500" />
                            <span className="text-gray-500">Business</span>
                            <span className="font-medium text-gray-900">
                                {profile.businessType}
                            </span>
                        </div>
                    )}
                </section>

                {/* Sign out */}
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.99]"
                    >
                        Sign out
                    </button>
                </div>
            </main>
        </div>
    );
}
