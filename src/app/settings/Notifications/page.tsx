'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NotificationPreferences = () => {
  const router = useRouter();

  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    newArrivals: false,
    priceDrops: true,
    newsletter: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#F6F2EE] px-4 pt-6">
      
  
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-medium text-gray-900 mb-6">
        Notification Preferences
      </h1>

      {/* Card */}
      <div className="bg-white rounded-xl divide-y">
        
        {/* Item */}
        <Preference
          title="Order Updates"
          desc="Get notified about order status changes"
          enabled={prefs.orderUpdates}
          onToggle={() => toggle('orderUpdates')}
        />

        <Preference
          title="Promotions & Offers"
          desc="Receive exclusive deals and discounts"
          enabled={prefs.promotions}
          onToggle={() => toggle('promotions')}
        />

        <Preference
          title="New Arrivals"
          desc="Be the first to know about new products"
          enabled={prefs.newArrivals}
          onToggle={() => toggle('newArrivals')}
        />

        <Preference
          title="Price Drops"
          desc="Get alerts when saved items go on sale"
          enabled={prefs.priceDrops}
          onToggle={() => toggle('priceDrops')}
        />

        <Preference
          title="Newsletter"
          desc="Weekly inspiration and home décor tips"
          enabled={prefs.newsletter}
          onToggle={() => toggle('newsletter')}
        />
      </div>
    </div>
  );
};

export default NotificationPreferences;



const Preference = ({
  title,
  desc,
  enabled,
  onToggle,
}: {
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>

      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition-colors ${
          enabled ? 'bg-[#1F2B1E]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};
