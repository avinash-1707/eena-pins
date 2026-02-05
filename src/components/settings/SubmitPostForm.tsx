"use client";

export default function SubmitPostForm() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Submit New Instagram Post</h2>
      <p className="text-sm text-gray-600 mb-4">
        Share your selected product post on Instagram to be eligible for creator rewards.
        Tag <span className="font-semibold">@haven</span> and use the hashtag{" "}
        <span className="font-semibold">#havenhome</span>.
      </p>
      <input
        type="url"
        placeholder="Instagram Post Link"
        className="w-full border rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <p className="text-xs text-gray-500 mb-4">
        Make sure your post includes product photos and your unique coupon code.
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition">
        Submit Post for Review
      </button>
    </div>
  );
}