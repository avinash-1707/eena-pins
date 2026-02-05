'use client';

import { useParams } from 'next/navigation';

export default function MessageThreadPage() {
  // mock routing-based data (backend will replace this)
  const threads = {
    lumina: {
      brand: 'Lumina Studio',
      orderId: 'HVN-45198',
      status: 'Delivered',
      messages: (
        <>
          <Card time="Yesterday, 2:30 PM">
            Hi! We wanted to show you the craftsmanship that goes into each piece. Here’s your pendant fresh from our workshop ✨
            <PlaceholderImage />
            <Caption>✨ Handcrafted with care in our studio</Caption>
          </Card>

          <Card time="January 24, 2026 · 7:30 PM">
            Your Brass Pendant Light has been carefully packaged and shipped.
          </Card>

          <Tracking />

          <Card time="January 24, 2026 · 8:45 PM">
            Great news! Your order has been delivered. We hope you love it 💚
          </Card>

          <Card time="You · January 24, 2026 · 7:20 PM" isUser>
            Received it! The light looks amazing, thank you 😊
          </Card>

          <Card time="Lumina Studio · January 24, 2026 · 8:12 PM">
            We’re so happy to hear that! Thank you for choosing Lumina Studio. If you need any help with installation, just let us know.
          </Card>
        </>
      ),
    },

    artisan: {
      brand: 'Artisan Collective',
      orderId: 'HVN-45167',
      status: 'Pending',
      messages: (
        <>
          <Card time="January 25, 2026 · 11:30 AM">
            Thank you for your order! Our artisans are handcrafting your Ceramic Vase Set. Here’s a behind-the-scenes look at the process.
            <ImageGrid />
            <Caption>🛠️ Your pieces being handcrafted by our artisans</Caption>
          </Card>
        </>
      ),
    },
  } as const;

  const active = threads.lumina; // change to artisan to preview

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex flex-col">
      <Header brand={active.brand} orderId={active.orderId} status={active.status} />

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {active.messages}
      </div>

      <BottomBar />
    </div>
  );
}

// ---------------- components ----------------
function Header({ brand, orderId, status }: any) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-[#f7f4ef]">
      <div className="h-10 w-10 rounded-full bg-gray-300" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{brand}</p>
        <p className="text-xs text-gray-500">Order #{orderId}</p>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
        {status}
      </span>
    </header>
  );
}

function Card({ children, time, isUser }: any) {
  return (
    <div className={`bg-white rounded-xl p-3 shadow-sm ${isUser ? 'ml-auto max-w-[90%]' : ''}`}>
      <p className="text-[11px] text-gray-400 mb-2">{time}</p>
      <div className="text-sm space-y-2">{children}</div>
    </div>
  );
}

function Tracking() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold mb-3">📦 TRACKING INFORMATION</p>
      <div className="text-xs space-y-1 mb-4">
        <p><span className="text-gray-500">Product:</span> Brass Pendant Light</p>
        <p><span className="text-gray-500">Tracking Number:</span> TRK123456789</p>
        <p><span className="text-gray-500">Carrier:</span> UPS Ground</p>
        <p><span className="text-gray-500">Estimated Delivery:</span> January 24, 2026</p>
      </div>
      <button className="w-full bg-[#1f2f1f] text-white rounded-full py-2 text-sm">Track Package</button>
    </div>
  );
}

function PlaceholderImage() {
  return <div className="h-48 w-full rounded-lg bg-gray-200" />;
}

function ImageGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="h-24 rounded-lg bg-gray-200" />
      <div className="h-24 rounded-lg bg-gray-200" />
      <div className="h-24 rounded-lg bg-gray-200" />
    </div>
  );
}

function Caption({ children }: any) {
  return <p className="text-[11px] text-gray-400">{children}</p>;
}

function BottomBar() {
  return (
    <div className="border-t bg-[#f7f4ef] px-3 py-2 space-y-2">
      <input disabled placeholder="Type your message..." className="w-full rounded-full px-4 py-3 text-sm bg-gray-200" />
      <div className="flex gap-2 overflow-x-auto">
        <button className="text-xs px-3 py-2 bg-white rounded-full shadow-sm">🚚 Delivery time?</button>
        <button className="text-xs px-3 py-2 bg-white rounded-full shadow-sm">✏️ Modify order</button>
        <button className="text-xs px-3 py-2 bg-white rounded-full shadow-sm">📦 Track package</button>
      </div>
    </div>
  );
}
