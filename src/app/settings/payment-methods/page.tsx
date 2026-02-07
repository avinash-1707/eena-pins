import { CreditCard, Lock } from "lucide-react";
import BackButton from "@/components/layout/BackButton";

type PaymentMethod = {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    brand: "visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "25",
    isDefault: true,
  },
];

export default function PaymentSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">
        <BackButton />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
            Payment Methods
          </h1>

          <button className="rounded-full bg-[#1F3D2B] px-4 py-2 text-sm font-medium text-white transition active:scale-95">
            + Add Card
          </button>
        </div>

        {/* Cards List */}
        {mockPaymentMethods.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EFEA] sm:h-11 sm:w-11">
                  <CreditCard className="h-5 w-5 text-neutral-700" />
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-900 sm:text-base">
                    •••• •••• •••• {card.last4}
                  </p>
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    Expires {card.expiryMonth}/{card.expiryYear}
                  </p>
                </div>
              </div>

              {/* Default Badge */}
              {card.isDefault && (
                <span className="rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-medium text-[#2E7D32] sm:text-sm">
                  Default
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Security Info */}
        <div className="rounded-2xl bg-[#F3EFEA] p-4 sm:p-5">
          <div className="flex gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-neutral-700" />

            <div>
              <p className="text-sm font-medium text-neutral-900 sm:text-base">
                Security Information
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                All payment information is encrypted and securely stored.
                We never share your financial details with third parties.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
