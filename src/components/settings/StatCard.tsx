"use client";

type Props = { title: string; value: string; subtitle: string };

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}