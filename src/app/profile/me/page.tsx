"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Building2,
  Send,
  Camera,
  Check,
  X,
  Copy,
} from "lucide-react";
import { signOut } from "next-auth/react";
// note: avoid using `useSearchParams` here to prevent CSR bailout during prerender
import BottomNav from "@/components/layout/BottomNav";

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
  brandRequestStatus: string | null;
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
  if (!value) return "Not Set";
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    if (local.length <= 2) return value;
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (value.length <= 4) return "••••";
  return "••••" + value.slice(-4);
}

interface EditingState {
  type: "profile-picture" | "email" | "phone" | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

function maskEmail(email: string | null): string {
  if (!email) return "Not Set";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string | null): string {
  if (!phone) return "Not Set";
  if (phone.length <= 4) return "••••";
  return "••••" + phone.slice(-4);
}

// Modal component for email verification
function EmailVerificationModal({
  isOpen,
  email,
  stage,
  loading,
  error,
  success,
  onSendVerification,
  onClose,
}: {
  isOpen: boolean;
  email: string | null;
  stage: "input" | "verify";
  loading: boolean;
  error: string | null;
  success: string | null;
  onSendVerification: (newEmail: string) => Promise<void>;
  onClose: () => void;
}) {
  const [newEmail, setNewEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center">
      <div className="w-full animate-in slide-in-from-bottom-5 rounded-t-2xl bg-white p-4 sm:m-auto sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Update Email</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {stage === "input" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Current: {maskEmail(email)}
              </p>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <X className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => onSendVerification(newEmail)}
                disabled={!newEmail || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Verification
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Check className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Verification email sent to
              </p>
              <p className="mt-1 font-medium text-gray-900">{newEmail}</p>
              <p className="mt-2 text-xs text-gray-500">
                Please click the verification link in your email to confirm the
                change.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Modal component for phone verification
function PhoneVerificationModal({
  isOpen,
  phone,
  stage,
  loading,
  error,
  onSendOTP,
  onVerifyOTP,
  onClose,
}: {
  isOpen: boolean;
  phone: string | null;
  stage: "input" | "otp";
  loading: boolean;
  error: string | null;
  onSendOTP: (newPhone: string) => Promise<void>;
  onVerifyOTP: (newPhone: string, otp: string) => Promise<void>;
  onClose: () => void;
}) {
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    await onSendOTP(newPhone);
    setPhoneSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center">
      <div className="w-full animate-in slide-in-from-bottom-5 rounded-t-2xl bg-white p-4 sm:m-auto sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Update Phone Number
          </h2>
          <button
            onClick={() => {
              onClose();
              setNewPhone("");
              setOtp("");
              setPhoneSubmitted(false);
            }}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!phoneSubmitted ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Phone Number
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Current: {maskPhone(phone)}
              </p>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <X className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  setNewPhone("");
                  setPhoneSubmitted(false);
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={!newPhone || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send OTP
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to
              </p>
              <p className="mt-1 font-medium text-gray-900">{newPhone}</p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl font-bold tracking-widest placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <X className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPhoneSubmitted(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={() => onVerifyOTP(newPhone, otp)}
                disabled={otp.length !== 6 || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PersonalProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBecomeBrandForm, setShowBecomeBrandForm] = useState(false);
  const [becomeBrandMessage, setBecomeBrandMessage] = useState("");
  const [becomeBrandSubmitting, setBecomeBrandSubmitting] = useState(false);
  const [becomeBrandError, setBecomeBrandError] = useState<string | null>(null);

  // Editing states
  const [editingState, setEditingState] = useState<EditingState>({
    type: null,
    loading: false,
    error: null,
    success: null,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalStage, setEmailModalStage] = useState<"input" | "verify">(
    "input",
  );
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModalStage, setPhoneModalStage] = useState<"input" | "otp">(
    "input",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

      // Check for email verification completion (read from window search params)
      try {
        const params = new URLSearchParams(window.location.search);
        const verifyToken = params.get("verifyEmail");
        const newEmail = params.get("newEmail");
        if (verifyToken && newEmail) {
          await confirmEmailVerification(verifyToken, newEmail);
        }
      } catch (e) {
        // ignore on SSR or if window not available
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  // Profile picture upload
  async function handleProfilePictureChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setEditingState({
        ...editingState,
        error: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditingState({
        ...editingState,
        error: "File size must be less than 5 MB",
      });
      return;
    }

    setEditingState({
      type: "profile-picture",
      loading: true,
      error: null,
      success: null,
    });

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "profile");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to upload profile picture");
      }

      const data = await res.json();

      // Update profile with new avatar URL
      await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.url }),
      });

      setEditingState({
        type: "profile-picture",
        loading: false,
        error: null,
        success: "Profile picture updated successfully",
      });

      // Refresh profile
      await fetchProfile();
      setPreviewImage(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setEditingState({
          type: null,
          loading: false,
          error: null,
          success: null,
        });
      }, 3000);
    } catch (err) {
      setEditingState({
        type: "profile-picture",
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
        success: null,
      });
    }
  }

  // Email verification
  async function handleSendEmailVerification(newEmail: string) {
    if (!newEmail) {
      setEditingState({
        ...editingState,
        error: "Please enter an email address",
      });
      return;
    }

    setEditingState({
      type: "email",
      loading: true,
      error: null,
      success: null,
    });

    try {
      const res = await fetch("/api/profile/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send verification email");
      }

      setEditingState({
        type: "email",
        loading: false,
        error: null,
        success: "Verification email sent",
      });

      setEmailModalStage("verify");
    } catch (err) {
      setEditingState({
        type: "email",
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
        success: null,
      });
    }
  }

  async function confirmEmailVerification(token: string, newEmail: string) {
    try {
      const res = await fetch("/api/profile/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditingState({
          type: "email",
          loading: false,
          error: data.error || "Failed to verify email",
          success: null,
        });
        return;
      }

      setEditingState({
        type: "email",
        loading: false,
        error: null,
        success: "Email verified and updated successfully",
      });

      // Refresh profile
      await fetchProfile();

      // Clear success message
      setTimeout(() => {
        setEditingState({
          type: null,
          loading: false,
          error: null,
          success: null,
        });
      }, 3000);
    } catch (err) {
      setEditingState({
        type: "email",
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
        success: null,
      });
    }
  }

  // Phone verification
  async function handleSendPhoneOTP(newPhone: string) {
    if (!newPhone) {
      setEditingState({
        ...editingState,
        error: "Please enter a phone number",
      });
      return;
    }

    setEditingState({
      type: "phone",
      loading: true,
      error: null,
      success: null,
    });

    try {
      const res = await fetch("/api/profile/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPhone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send OTP");
      }

      setEditingState({
        type: "phone",
        loading: false,
        error: null,
        success: "OTP sent",
      });

      setPhoneModalStage("otp");
    } catch (err) {
      setEditingState({
        type: "phone",
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
        success: null,
      });
    }
  }

  async function handleVerifyPhoneOTP(newPhone: string, otp: string) {
    if (!otp || otp.length !== 6) {
      setEditingState({
        ...editingState,
        error: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    setEditingState({
      type: "phone",
      loading: true,
      error: null,
      success: null,
    });

    try {
      const res = await fetch("/api/profile/confirm-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPhone, otp }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to verify OTP");
      }

      setEditingState({
        type: "phone",
        loading: false,
        error: null,
        success: "Phone number updated successfully",
      });

      // Refresh profile
      await fetchProfile();
      setShowPhoneModal(false);
      setPhoneModalStage("input");

      // Clear success message
      setTimeout(() => {
        setEditingState({
          type: null,
          loading: false,
          error: null,
          success: null,
        });
      }, 3000);
    } catch (err) {
      setEditingState({
        type: "phone",
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
        success: null,
      });
    }
  }

  async function submitBecomeBrandRequest() {
    if (!profile) return;
    setBecomeBrandSubmitting(true);
    setBecomeBrandError(null);
    try {
      const res = await fetch("/api/brand-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: becomeBrandMessage.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBecomeBrandError(data.message ?? "Failed to submit request");
        return;
      }
      setShowBecomeBrandForm(false);
      setBecomeBrandMessage("");
      await fetchProfile();
    } catch {
      setBecomeBrandError("Something went wrong");
    } finally {
      setBecomeBrandSubmitting(false);
    }
  }

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
        {/* Global success message */}
        {editingState.success && (
          <div className="mb-4 flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <Check className="h-5 w-5 shrink-0" />
            <p>{editingState.success}</p>
          </div>
        )}

        {/* Header with avatar and name */}
        <header className="text-center">
          <div className="relative mx-auto inline-block">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-purple-100 shadow-lg ring-2 ring-purple-200 sm:h-28 sm:w-28">
              {previewImage || profile.avatarUrl ? (
                <Image
                  src={previewImage || profile.avatarUrl || ""}
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={editingState.loading}
              className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 shadow-md transition-colors hover:bg-purple-700 disabled:opacity-50"
              title="Change profile picture"
            >
              {editingState.type === "profile-picture" &&
              editingState.loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
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

        {/* Contact Info - Editable */}
        <section className="mt-6 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-purple-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Email
                </span>
                <span className="font-medium text-gray-900">
                  {maskEmail(profile.email)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowEmailModal(true);
                setEmailModalStage("input");
                setEditingState({
                  type: null,
                  loading: false,
                  error: null,
                  success: null,
                });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50"
            >
              Edit
            </button>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-purple-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Phone
                </span>
                <span className="font-medium text-gray-900">
                  {maskPhone(profile.phone)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPhoneModal(true);
                setPhoneModalStage("input");
                setEditingState({
                  type: null,
                  loading: false,
                  error: null,
                  success: null,
                });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50"
            >
              Edit
            </button>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-purple-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Joined
              </span>
              <span className="font-medium text-gray-900">
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </section>

        {/* Become a brand (USER only) */}
        {profile.role === "USER" && (
          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {profile.brandRequestStatus === "PENDING" ? (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request pending</p>
                  <p className="text-xs text-gray-500">
                    Admins will review your request to become a brand.
                  </p>
                </div>
              </div>
            ) : showBecomeBrandForm ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">
                  Request to become a brand
                </p>
                <textarea
                  placeholder="Optional message for admins…"
                  value={becomeBrandMessage}
                  onChange={(e) => setBecomeBrandMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                {becomeBrandError && (
                  <p className="text-sm text-red-600">{becomeBrandError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBecomeBrandForm(false);
                      setBecomeBrandError(null);
                    }}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitBecomeBrandRequest}
                    disabled={becomeBrandSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {becomeBrandSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit request
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowBecomeBrandForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 active:scale-[0.99]"
              >
                <Building2 className="h-5 w-5" />
                Become a brand
              </button>
            )}
          </section>
        )}

        <BottomNav />

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

      {/* Modals */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        email={profile.email}
        stage={emailModalStage}
        loading={editingState.type === "email" && editingState.loading}
        error={editingState.type === "email" ? editingState.error : null}
        success={null}
        onSendVerification={handleSendEmailVerification}
        onClose={() => {
          setShowEmailModal(false);
          setEmailModalStage("input");
          setEditingState({
            type: null,
            loading: false,
            error: null,
            success: null,
          });
        }}
      />

      <PhoneVerificationModal
        isOpen={showPhoneModal}
        phone={profile.phone}
        stage={phoneModalStage}
        loading={editingState.type === "phone" && editingState.loading}
        error={editingState.type === "phone" ? editingState.error : null}
        onSendOTP={handleSendPhoneOTP}
        onVerifyOTP={handleVerifyPhoneOTP}
        onClose={() => {
          setShowPhoneModal(false);
          setPhoneModalStage("input");
          setEditingState({
            type: null,
            loading: false,
            error: null,
            success: null,
          });
        }}
      />
    </div>
  );
}
