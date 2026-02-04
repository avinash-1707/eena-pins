'use client';

import React from 'react';
import { ChevronRight, ArrowLeft, Chrome, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock active sessions data
const activeSessions = [
  {
    id: 'session-1',
    device: 'Windows',
    browser: 'Chrome',
    location: 'Mumbai, India',
    isCurrent: true,
    lastActive: 'Current session'
  }
];

export default function SecuritySettingsPage() {
  const router = useRouter();

  const handleChangePassword = () => {
    console.log('Navigate to change password');
    // Navigate to password change page or open modal
  };

  const handleEndSession = (sessionId: string) => {
    console.log('Ending session:', sessionId);
    // Add logic to end session
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Security Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Password</h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-500 mb-3">Last changed 45 days ago</p>
            <button
              onClick={handleChangePassword}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-gray-900 font-medium">Change Password</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Active Sessions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Sessions</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    {/* Device Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {session.device === 'Windows' ? (
                        <Monitor className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Chrome className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {session.device} • {session.browser}
                        </p>
                        {session.isCurrent && (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.location}</p>
                      <p className="text-xs text-gray-400 mt-1">{session.lastActive}</p>
                    </div>
                  </div>

                  {/* End Session Button (only for non-current sessions) */}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      End
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Factor Authentication (Optional) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Two-Factor Authentication</h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Add an extra layer of security to your account
            </p>
            <button className="flex items-center justify-between w-full text-left">
              <span className="text-gray-900 font-medium">Enable 2FA</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
