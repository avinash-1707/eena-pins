"use client";

import DashboardHeader from "@/components/settings/DashboardHeader";
import StatCard from "@/components/settings/StatCard";
import SubmitPostForm from "@/components/settings/SubmitPostForm";
import CouponCard from "@/components/settings/CouponCard";
import SubmissionCard from "@/components/settings/SubmissionCard";
import RewardsInfo from "@/components/settings/RewardsInfo";

export default function CreatorDashboardPage() {
  // Mock data (replace with API later)
  const coupons = [
    {
      status: "Active",
      product: "Modern Ceramic Vase",
      code: "HAVEN75-ABC123",
      submitted: "09/01/2023",
      expires: "09/30/2023",
    },
    {
      status: "Active",
      product: "Minimalist Wall Art",
      code: "HAVEN60-DEF456",
      submitted: "09/15/2023",
      expires: "09/30/2023",
    },
  ];

  const submissions = [
    {
      status: "Approved",
      product: "Modern Ceramic Vase",
      submitted: "09/01/2023",
      discount: "75%",
      link: "#",
    },
    {
      status: "Approved",
      product: "Minimalist Wall Art",
      submitted: "09/15/2023",
      discount: "60%",
      link: "#",
    },
    {
      status: "Pending Review",
      product: "Linen Throw Pillow",
      submitted: "09/20/2023",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen space-y-10">
      <DashboardHeader />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard title="Active Coupons" value="2" subtitle="Ready to use" />
        <StatCard title="Total Posts" value="3" subtitle="Submissions" />
      </div>

      <SubmitPostForm />

      {/* Coupons */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Your Active Coupons</h2>
        {coupons.map((c, i) => (
          <CouponCard key={i} {...c} />
        ))}
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">All Submissions</h2>
        {submissions.map((s, i) => (
          <SubmissionCard key={i} {...s} />
        ))}
      </div>

      <RewardsInfo />
    </div>
  );
}