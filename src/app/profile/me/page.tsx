"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    User,
    Bookmark,
    Star,
    Calendar,
    Mail,
    Phone,
    Loader2,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface ProfileData {
    id: string;
    email: string | null;
    phone: string | null;
    username: string;
    name: string | null;
    description: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
    _count: {
        collections: number;
        ratings: number;
    };
}

function getInitials(name: string | null, username: string): string {
    if (name?.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
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

export default function PersonalProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile/me");
                if (!res.ok) {
                    if (res.status === 401) {
                        setError("Please sign in to view your profile.");
                        return;
                    }
                    const data = await res.json().catch(() => ({}));
                    setError(data.message ?? "Failed to load profile");
                    return;
                }
                const data = await res.json();
                setProfile(data);
            } catch {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                    <p className="mt-4 text-sm text-gray-500">Loading profile…</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-white">
                <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="rounded-full bg-purple-50 p-4">
                        <User className="h-10 w-10 text-purple-500" />
                    </div>
                    <p className="mt-4 text-gray-700">{error ?? "Profile not found"}</p>
                    {error?.includes("sign in") && (
                        <a
                            href="/sign-in"
                            className="mt-4 inline-flex items-center rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                        >
                            Sign in
                        </a>
                    )}
                </div>
            </div>
        );
    }

    const initials = getInitials(profile.name, profile.username);
    const displayName = profile.name?.trim() || profile.username;

    return (
        <div className="min-h-screen bg-white">
            <main className="mx-auto max-w-md px-4 pb-12 pt-6 sm:pt-8">
                {/* Header with avatar and name */}
                <header className="text-center">
                    <div className="relative mx-auto inline-block">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-purple-100 shadow-lg ring-2 ring-purple-200 sm:h-28 sm:w-28">
                            {profile.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt={displayName}
                                    width={112}
                                    height={112}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-semibold text-purple-600 sm:text-3xl">
                                    {initials}
                                </span>
                            )}
                        </div>
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
                        {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
                    <span className="mt-2 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {profile.role}
                    </span>
                </header>

                {/* Description */}
                {profile.description && (
                    <section className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 sm:px-5 sm:py-4">
                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            {profile.description}
                        </p>
                    </section>
                )}

                {/* Stats */}
                <section className="mt-6 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                            <Bookmark className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                {profile._count.collections}
                            </p>
                            <p className="text-xs text-gray-500">Collections</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                            <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                {profile._count.ratings}
                            </p>
                            <p className="text-xs text-gray-500">Ratings</p>
                        </div>
                    </div>
                </section>

                {/* Contact & joined */}
                <section className="mt-6 space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 shrink-0 text-purple-500" />
                        <span className="text-gray-500">Joined</span>
                        <span className="font-medium text-gray-900">
                            {formatDate(profile.createdAt)}
                        </span>
                    </div>
                    {profile.email && (
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 shrink-0 text-purple-500" />
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">
                                {maskContact(profile.email)}
                            </span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 shrink-0 text-purple-500" />
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-900">
                                {maskContact(profile.phone)}
                            </span>
                        </div>
                    )}
                </section>

                {/* Sign out */}
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.99]"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </main>
        </div>
    );
}
