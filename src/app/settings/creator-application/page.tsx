'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/layout/BackButton';

export default function CreatorApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    instagramHandle: '',
    followers: '',
    samplePostLink: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Application submitted! We will review it within 24 hours.');
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#F6F2EE] px-4 pt-6 pb-32">
      <BackButton />
      
      {/* Header */}
      <div className="bg-white rounded-xl p-4 mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-base font-medium text-gray-900">
            Creator Application
          </h1>
          <p className="text-sm text-gray-500">
            Share your details to join our creator program
          </p>
        </div>
        <button onClick={() => router.back()}>
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-[#F7F0FF] border border-[#E5D8FF] rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">
          Why Join the eéna Creator Program?
        </p>

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-purple-600">✓</span>
            <span>
              <strong>Earn up to 90% discount</strong> on your next purchase when you share your Haven finds
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-600">✓</span>
            <span>
              Post product pictures on Instagram, tag <strong>@eéna</strong> and the brand unlock discounts
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-600">✓</span>
            <span>
              Build your portfolio while shopping your favorite home decor
            </span>
          </li>
        </ul>
      </div>

      {/* Form */}
      <form className="space-y-5">
        {[
          { label: 'Full Name', name: 'fullName', placeholder: 'Sarah Johnson', type: 'text' },
          { label: 'Username', name: 'username', placeholder: 'sarah_home_vibes', type: 'text' },
          { label: 'Instagram Handle', name: 'instagramHandle', placeholder: '@sarah_home_vibes', type: 'text' },
          { label: 'Number of Followers', name: 'followers', placeholder: '10000', type: 'number' },
          { label: 'Sample Instagram Post Link', name: 'samplePostLink', placeholder: 'https://instagram.com/p/...', type: 'url' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {field.label} <span className="text-red-500">*</span>
            </label>
            <input
              type={field.type}
              name={field.name}
              value={(formData as any)[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required
              className="w-full h-11 rounded-lg bg-[#EFEAE3] px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {field.name === 'samplePostLink' && (
              <p className="text-xs text-gray-500 mt-2">
                Share a link to one of your best home decor posts
              </p>
            )}
          </div>
        ))}

        {/* Verification */}
        <div className="bg-[#F7F0FF] border border-[#E5D8FF] rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Verification Process
          </p>
          <p className="text-sm text-gray-700">
            Our team will review your application within 24 hours. You’ll receive an email once your account is verified.
          </p>
        </div>
      </form>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-11 rounded-lg border border-gray-300 text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-lg bg-[#E9FF2F] text-gray-900 font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
