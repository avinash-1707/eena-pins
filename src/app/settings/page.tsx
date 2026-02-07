"use client";

import React from 'react';
import SettingsMenuList from '@/components/settings/SettingsMenuList';
import CreatorCard from '@/components/settings/CreatorCard';
import BrandCard from '@/components/settings/BrandCard';
import BackButton from '@/components/layout/BackButton';

export default function SettingsPage() {
  return (
    <div className="min-h-screen dotted-background">
      <main className="pt-10 pb-8 px-4 max-w-2xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Page Title */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm" >
        <h1 className="text-2xl  font-bold text-gray-900 mb-4">Settings</h1> 
        <h5 className="text-gray-600">Manage your account settings and preferences</h5>
        </div>

        {/* Settings Menu */}
        <div className="mb-6">
          <SettingsMenuList />
        </div>

        {/* Creator Card */}
        <div className="mb-6">
          <CreatorCard />
        </div>

        {/* Brand Card */}
        <div className="mb-6">
          <BrandCard />
        </div>
      </main>
    </div>
  );
}


