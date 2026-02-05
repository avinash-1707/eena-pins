"use client";

type Props = {
  status: string;
  product: string;
  code: string;
  submitted: string;
  expires: string;
};

export default function CouponCard({ status, product, code, submitted, expires }: Props) {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold text-green-600">{status}</p>
        <p className="text-gray-800">{product}</p>
        <p className="text-xs text-gray-500">Code: {code}</p>
        <p className="text-xs text-gray-500">Submitted: {submitted}</p>
      </div>
      <p className="text-xs text-gray-500">Expires: {expires}</p>
    </div>
  );
}