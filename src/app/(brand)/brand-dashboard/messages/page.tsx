"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type BrandConversation = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  brandProfileId: string;
  brandName: string;
  brandLogo?: string;
  orderId: string;
  orderReceipt?: string;
  orderStatus: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export default function BrandMessagesPage() {
  const [conversations, setConversations] = useState<BrandConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const statusStyles: Record<string, string> = {
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    PROCESSING: "bg-orange-100 text-orange-700",
    CREATED: "bg-gray-100 text-gray-700",
    PAID: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-pink-100 text-pink-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="px-4 py-4 border-b bg-white sticky top-0">
          <h1 className="text-lg font-semibold">Messages 💬</h1>
        </header>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-gray-500">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="px-4 py-4 border-b bg-white sticky top-0">
        <h1 className="text-lg font-semibold">Customer Messages 💬</h1>
        <p className="text-xs text-gray-500 mt-1">
          {conversations.length} conversation
          {conversations.length !== 1 ? "s" : ""}
        </p>
      </header>

      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {conversations.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh] px-4">
          <div className="bg-white rounded-2xl shadow-md px-6 py-8 text-center w-full max-w-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              💬
            </div>
            <p className="text-lg font-semibold">No Customer Messages</p>
            <p className="text-sm text-gray-500 mt-1">
              Customer conversations will appear here once they place an order
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/brand-dashboard/messages/${conv.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-gray-100 transition border-b"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 shrink-0 overflow-hidden">
                  {conv.userAvatar ? (
                    <img
                      src={conv.userAvatar}
                      alt={conv.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{conv.userName}</p>
                  <p className="text-xs text-gray-500">
                    Order #{conv.orderReceipt || conv.orderId}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {conv.lastMessageText || "No messages yet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleDateString()
                      : "Just now"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {conv.unreadCount && conv.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                      {conv.unreadCount}
                    </span>
                  )}
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                      statusStyles[conv.orderStatus] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {conv.orderStatus}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
