"use client";

import React from 'react';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsMenuList from '@/components/settings/SettingsMenuList';
import CreatorCard from '@/components/settings/CreatorCard';
import BrandCard from '@/components/settings/BrandCard';

export default function SettingsPage() {
  return (
    <div className="min-h-screen dotted-background">
      <SettingsHeader />

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

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


