"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

type Step = "phone" | "otp";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState<"phone" | "otp" | "google" | null>(
    null,
  );
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    setError("");
    setLoading("phone");
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(null);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }
    setError("");
    setLoading("otp");
    try {
      const result = await signIn("phone-otp", {
        phone: phone.trim(),
        otp: otp.trim(),
        redirect: false,
        callbackUrl,
      });
      if (result?.error) throw new Error(result.error);
      if (result?.url) window.location.href = result.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    setLoading("google");
    signIn("google", { callbackUrl });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f7f6f9] flex flex-col items-center">
      {/* Ambient glow top */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -160,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 380,
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.16) 0%, rgba(167,139,250,0.04) 50%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      {/* Ambient glow bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -90,
          right: -90,
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(196,181,253,0.13) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
      />

      {/* Centred layout */}
      <div className="relative z-10 w-full max-w-sm px-5 flex flex-col items-center justify-center min-h-screen">
        {/* Logo mark */}
        <Image
          src="/images/logo.png"
          alt="eena-logo"
          height={64}
          width={200}
          className="mb-12 object-contain w-42 sm:w-50 h-auto"
        />

        {/* Card */}
        <div className="w-full bg-white rounded-3xl border border-violet-100 shadow-[0_4px_32px_rgba(139,92,246,0.07),0_1px_4px_rgba(0,0,0,0.04)] px-6 pt-7 pb-8">
          {/* Back button — OTP step only */}
          {step === "otp" && (
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
                setOtp("");
              }}
              className="mb-4 -ml-1 flex items-center gap-1.5 text-violet-500 hover:text-violet-700 transition-colors duration-200"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium">Back</span>
            </button>
          )}

          {/* Heading */}
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-[-0.02em] leading-tight">
            {step === "phone" ? "Welcome back" : "Verify your number"}
          </h1>
          <p className="text-[13px] text-gray-400 mt-1.5 mb-6 leading-snug">
            {step === "phone" ? (
              "Sign in with your phone number"
            ) : (
              <>
                {`We sent a 6-digit code to `}
                <span className="text-violet-600 font-semibold">{phone}</span>
              </>
            )}
          </p>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100"
            >
              <svg
                className="mt-0.5 w-4 h-4 shrink-0 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[13px] text-red-600 font-medium">
                {error}
              </span>
            </div>
          )}

          {/* ─── PHONE STEP ───────────────────────────────────────────────── */}
          {step === "phone" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">
                Phone number
              </label>
              <input
                type="tel"
                autoFocus
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#fafafa] text-[15px] text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
              />

              {/* Send code CTA */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading === "phone"}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white text-[14px] font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.28)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.38)] active:scale-[0.97] disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading === "phone" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send code"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-linear-to-r from-transparent to-gray-200" />
                <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
                  or
                </span>
                <div className="flex-1 h-px bg-linear-to-l from-transparent to-gray-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading === "google"}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:border-gray-300 hover:bg-[#fafafa] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>
            </div>
          )}

          {/* ─── OTP STEP ─────────────────────────────────────────────────── */}
          {step === "otp" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">
                Verification code
              </label>

              {/* Segmented 6-digit input */}
              <div className="flex gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    autoComplete={i === 0 ? "one-time-code" : undefined}
                    value={otp[i] ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (!val) {
                        const next = otp.slice(0, i) + otp.slice(i + 1);
                        setOtp(next);
                        (
                          e.target
                            .previousElementSibling as HTMLInputElement | null
                        )?.focus();
                        return;
                      }
                      const next = otp.slice(0, i) + val[0] + otp.slice(i + 1);
                      setOtp(next.slice(0, 6));
                      (
                        e.target.nextElementSibling as HTMLInputElement | null
                      )?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i]) {
                        e.preventDefault();
                        const prev = (e.target as HTMLInputElement)
                          .previousElementSibling as HTMLInputElement | null;
                        if (prev) {
                          setOtp(otp.slice(0, i - 1) + otp.slice(i));
                          prev.focus();
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(pasted);
                      const cells =
                        e.currentTarget.parentElement?.querySelectorAll(
                          "input",
                        );
                      cells?.[Math.min(pasted.length, 5)]?.focus();
                    }}
                    className="w-11 h-13 rounded-xl text-center border border-gray-200 bg-[#fafafa] text-[19px] font-semibold text-gray-900 outline-none transition-all duration-200 focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder-gray-200 caret-violet-500"
                    placeholder="·"
                  />
                ))}
              </div>

              {/* Verify CTA */}
              <button
                type="button"
                onClick={handlePhoneSignIn}
                disabled={loading === "otp"}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white text-[14px] font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.28)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.38)] active:scale-[0.97] disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading === "otp" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify & sign in"
                )}
              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading === "phone"}
                className="mt-3 w-full text-[13px] font-medium text-violet-500 hover:text-violet-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading === "phone" ? "Sending…" : "Resend code"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-gray-300 px-2 leading-relaxed">
          By signing in you agree to our{" "}
          <span className="underline decoration-dotted cursor-pointer hover:text-gray-400 transition-colors">
            terms
          </span>{" "}
          and{" "}
          <span className="underline decoration-dotted cursor-pointer hover:text-gray-400 transition-colors">
            privacy policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
