'use client';

import React, { useState } from 'react';
import { X, Lightbulb, Instagram, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    instagramHandle: '',
    followers: '',
    samplePostLink: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creator Application Submitted:', formData);
    // Add submission logic here
    alert('Application submitted! We will review it within 24 hours.');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Creator Application</h1>
            <p className="text-sm text-gray-500">Share your details to join our creator program</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto pb-32">
        {/* Info Card */}
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">
                Why Join the eéna Creator Program?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>
                    <span className="font-semibold">Earn up to 60% discount</span> on your next purchase when you share your favorite finds
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>
                    Post product pictures on Instagram, tag <span className="font-semibold">@eéna</span> and the brand unlock discounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Build your portfolio while shopping your favorite home decor</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Sarah Johnson"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="sarah_home_vibes"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Instagram Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Instagram Handle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleChange}
                placeholder="@sarah_home_vibes"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Number of Followers */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Number of Followers <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="followers"
              value={formData.followers}
              onChange={handleChange}
              placeholder="10000"
              required
              min="0"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Sample Instagram Post Link */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sample Instagram Post Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="samplePostLink"
              value={formData.samplePostLink}
              onChange={handleChange}
              placeholder="https://instagram.com/p/..."
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Share a link to one of your best home decor posts
            </p>
          </div>

          {/* Verification Process Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Verification Process</h4>
                <p className="text-sm text-gray-700">
                  Our team will review your application within 24 hours. You'll receive an email notification once approved!
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 active:scale-95 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}