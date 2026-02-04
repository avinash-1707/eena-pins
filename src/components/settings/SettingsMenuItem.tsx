'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface SettingsMenuItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number;
}

const SettingsMenuItem = ({ icon: Icon, label, route, badge }: SettingsMenuItemProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <span className="text-base font-medium text-gray-900">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {badge && badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
};

export default SettingsMenuItem;