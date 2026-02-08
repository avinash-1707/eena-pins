"use client";

type Props = {
  status: string;
  product: string;
  submitted: string;
  discount?: string;
  link?: string;
};

export default function SubmissionCard({
  status,
  product,
  submitted,
  discount,
  link,
}: Props) {
  const statusColor =
    status.toLowerCase().includes("approved")
      ? "text-green-600"
      : status.toLowerCase().includes("pending")
        ? "text-yellow-600"
        : "text-gray-600";

  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className={`text-sm font-semibold ${statusColor}`}>{status}</p>
        <p className="text-gray-800">{product}</p>
        <p className="text-xs text-gray-500">Submitted: {submitted}</p>
        {discount && <p className="text-xs text-gray-500">Discount: {discount}</p>}
      </div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View Post
        </a>
      )}
    </div>
  );
}
