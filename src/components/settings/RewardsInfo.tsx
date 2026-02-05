"use client";

export default function RewardsInfo() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">How Creator Rewards Work</h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
        <li>Purchase and review your Haven product.</li>
        <li>Create a post and publish it on Instagram.</li>
        <li>Submit your post for review.</li>
        <li>
          Once approved, you’ll receive a coupon code for up to{" "}
          <span className="font-semibold">100% off</span> your next product.
        </li>
      </ol>
    </div>
  );
}