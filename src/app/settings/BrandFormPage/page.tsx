"use client";

import { useState } from "react";
import { Upload, Mail, Phone, MapPin, User, Building } from "lucide-react";

type BrandFormData = {
  brandLogo: File | null;
  brandName: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  categories: string[];
};

export default function BrandFormPage() {
  const [formData, setFormData] = useState<BrandFormData>({
    brandLogo: null,
    brandName: "",
    contactName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    description: "",
    categories: [],
  });

  const categories = [
    "Furniture",
    "Lighting",
    "Decor",
    "Plants",
    "Kitchenware",
    "Textiles",
    "Art",
    "Storage",
    "Outdoor",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, brandLogo: file }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Mock submit successful! (Check console for payload)");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Brand Information</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Brand Logo *</label>
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 hover:border-blue-500 transition">
            <Upload className="w-5 h-5 text-gray-400" />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Brand Name *</label>
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
            <Building className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              placeholder="Your Brand Name"
              className="flex-1 outline-none"
              required
            />
          </div>
        </div>

        {/* Contact Name */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Contact Name *</label>
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="John Doe"
              className="flex-1 outline-none"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Email *</label>
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@yourbrand.com"
              className="flex-1 outline-none"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Phone *</label>
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="flex-1 outline-none"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Business Address *</label>
          <div className="space-y-3">
            <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="street"
                placeholder="123 Main Street"
                value={formData.street}
                onChange={handleChange}
                className="flex-1 outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={formData.zip}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Brand Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your brand, your story, and what makes your products special..."
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            required
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Product Categories *</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const selected = formData.categories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-5 py-2 rounded-lg border bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}