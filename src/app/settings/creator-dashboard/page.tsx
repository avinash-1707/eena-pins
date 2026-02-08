"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/settings/DashboardHeader";
import StatCard from "@/components/settings/StatCard";
import SubmitPostForm from "@/components/settings/SubmitPostForm";
import CouponCard from "@/components/settings/CouponCard";
import SubmissionCard from "@/components/settings/SubmissionCard";
import RewardsInfo from "@/components/settings/RewardsInfo";

type ApiCoupon = {
  id: string;
  code: string;
  discountPercent: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
};

type ApiCreatorPost = {
  id: string;
  link: string;
  status: string;
  createdAt: string;
  coupon?: ApiCoupon | null;
};

export default function CreatorDashboardPage() {
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [submissions, setSubmissions] = useState<ApiCreatorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [couponRes, postRes] = await Promise.all([
        fetch("/api/creator-coupons"),
        fetch("/api/creator-posts"),
      ]);

      const couponData = await couponRes.json().catch(() => []);
      const postData = await postRes.json().catch(() => []);

      if (!couponRes.ok) {
        throw new Error(couponData.message ?? "Failed to load coupons");
      }
      if (!postRes.ok) {
        throw new Error(postData.message ?? "Failed to load submissions");
      }

      setCoupons(couponData);
      setSubmissions(postData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load creator data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCoupons = coupons.filter((c) => c.status === "ACTIVE");

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen space-y-10">
      <DashboardHeader />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard
          title="Active Coupons"
          value={String(activeCoupons.length)}
          subtitle="Ready to use"
        />
        <StatCard
          title="Total Posts"
          value={String(submissions.length)}
          subtitle="Submissions"
        />
      </div>

      <SubmitPostForm onSubmitted={fetchData} />

      {/* Coupons */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Your Active Coupons
          </h2>
          <button
            onClick={() => fetchData()}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading coupons...</p>
        ) : activeCoupons.length === 0 ? (
          <p className="text-sm text-gray-500">No active coupons yet.</p>
        ) : (
          activeCoupons.map((c) => (
            <CouponCard
              key={c.id}
              status={c.status === "ACTIVE" ? "Active" : c.status}
              product="Creator reward"
              code={c.code}
              submitted={new Date(c.createdAt).toLocaleDateString()}
              expires={
                c.expiresAt
                  ? new Date(c.expiresAt).toLocaleDateString()
                  : "No expiry"
              }
            />
          ))
        )}
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">All Submissions</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        ) : (
          submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              status={
                s.status === "PENDING_REVIEW"
                  ? "Pending Review"
                  : s.status === "APPROVED"
                    ? "Approved"
                    : "Rejected"
              }
              product="Instagram post"
              submitted={new Date(s.createdAt).toLocaleDateString()}
              discount={
                s.coupon?.discountPercent
                  ? `${s.coupon.discountPercent}%`
                  : undefined
              }
              link={s.link}
            />
          ))
        )}
      </div>

      <RewardsInfo />
    </div>
  );
}
