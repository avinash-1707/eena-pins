"use client";

import { useState } from "react";

type Props = {
  onSubmitted?: () => void;
};

export default function SubmitPostForm({ onSubmitted }: Props) {
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!link.trim()) {
      setError("Please add an Instagram post link.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/creator-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to submit post");
        return;
      }
      setLink("");
      setSuccess("Post submitted for review.");
      onSubmitted?.();
    } catch {
      setError("Failed to submit post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        Submit New Instagram Post
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Share your selected product post on Instagram to be eligible for
        creator rewards. Tag <span className="font-semibold">@eena</span> and
        use the hashtag <span className="font-semibold">#eenahome</span>.
      </p>
      {error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-2 text-sm text-green-600" role="status">
          {success}
        </p>
      )}
      <input
        type="url"
        placeholder="Instagram Post Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        disabled={submitting}
        className="w-full border rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
      />
      <p className="text-xs text-gray-500 mb-4">
        Make sure your post includes product photos and your unique coupon
        code.
      </p>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Post for Review"}
      </button>
    </div>
  );
}
