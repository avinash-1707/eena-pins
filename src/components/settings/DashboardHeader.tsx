"use client";
import { ArrowLeft, BadgeCheck } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Creator Dashboard
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <BadgeCheck className="w-5 h-5" /> Verified Creator
          </span>
        </h1>
        <p className="text-gray-600 text-sm">
          Manage your content submissions and track your exclusive creator discounts.
        </p>
      </div>
    </div>
  );
}