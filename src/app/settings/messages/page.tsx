// app/settings/messages/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

// ------------------ types (future‑proof for backend) ------------------
export type MessageThread = {
  id: string;
  brandName: string;
  avatar?: string;
  orderId: string;
  lastMessage: string;
  updatedAt: string; // ISO
  status: 'shipped' | 'delivered' | 'pending';
  unreadCount?: number;
};

// ------------------ mock data ------------------
const MOCK_THREADS: MessageThread[] = [
  {
    id: '1',
    brandName: 'Nordic Living',
    orderId: 'HVN-45231',
    lastMessage: 'Your order has been shipped! 🚚',
    updatedAt: '2 hours ago',
    status: 'shipped',
    unreadCount: 1,
  },
  {
    id: '2',
    brandName: 'Lumina Studio',
    orderId: 'HVN-45198',
    lastMessage: 'Delivered! Hope you love it ✨',
    updatedAt: '3 days ago',
    status: 'delivered',
  },
  {
    id: '3',
    brandName: 'Artisan Collective',
    orderId: 'HVN-45167',
    lastMessage: 'Your order is being prepared',
    updatedAt: '1 day ago',
    status: 'pending',
  },
];

const statusStyles: Record<MessageThread['status'], string> = {
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
};

export default function MessagesPage() {
  const [threads] = useState(MOCK_THREADS); // replace with API later

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <header className="px-4 py-3 border-b bg-[#f7f4ef] sticky top-0">
        <h1 className="text-lg font-semibold">Messages 💬</h1>
      </header>

      {threads.length === 0 ? (
        <div className="flex items-center justify-center h-[70vh] px-4">
          <div className="bg-white rounded-2xl shadow-md px-6 py-8 text-center w-full max-w-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              💬
            </div>
            <p className="text-lg font-semibold">Select a Conversation</p>
            <p className="text-sm text-gray-500 mt-1">
              Choose a brand conversation to view messages and tracking updates
            </p>
          </div>
        </div>
      ) : (
        <ul>
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/settings/messages/${t.id}`}
                className="flex items-center gap-3 px-4 py-4"
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0" />

                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.brandName}</p>
                  <p className="text-xs text-gray-500">Order #{t.orderId}</p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {t.lastMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t.updatedAt}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {t.unreadCount && (
                    <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {t.unreadCount}
                    </span>
                  )}
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${statusStyles[t.status]}`}
                  >
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
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
