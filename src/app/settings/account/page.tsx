'use client';

import React, { useState } from 'react';
import { ChevronRight, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('');
  const [currency, setCurrency] = useState('');

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      console.log('Deleting account...');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F2EE] px-4 pt-6 pb-10">
      

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-medium text-gray-900 mb-6">
        Account Settings
      </h1>

      
      <div className="bg-white rounded-xl p-4 mb-4">
        <h2 className="font-medium text-gray-900 mb-4">
          Language & Region
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Language</p>
            <div className="h-10 rounded-lg bg-[#EFEAE3]" />
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Currency</p>
            <div className="h-10 rounded-lg bg-[#EFEAE3]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl mb-4 divide-y">
        <div className="p-4 font-medium text-gray-900">
          Privacy
        </div>

        <Row label="Download My Data" />
        <Row label="Privacy Policy" />
        <Row label="Terms of Service" />
      </div>


      <div className="rounded-xl border border-red-200 bg-[#FFF6F6] p-4 mb-6">
        <h2 className="text-sm font-medium text-red-600 mb-2">
          Danger Zone
        </h2>

        <p className="text-xs text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition"
        >
          Delete Account
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-white rounded-xl py-4 flex items-center justify-center gap-2 text-gray-700 font-medium"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}

const Row = ({ label }: { label: string }) => (
  <button className="w-full flex items-center justify-between px-4 py-4">
    <span className="text-sm text-gray-900">{label}</span>
    <ChevronRight size={18} className="text-gray-400" />
  </button>
);
