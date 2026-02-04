import { MapPin, Pencil, Trash2 } from "lucide-react";

type Address = {
  id: string;
  title: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  isDefault: boolean;
};

const mockAddresses: Address[] = [
  {
    id: "1",
    title: "Home",
    label: "Home",
    addressLine1: "123 Marine Drive, Apartment 4B",
    addressLine2: "Mumbai, Maharashtra - 400020",
    phone: "+91 9876543210",
    isDefault: true,
  },
  {
    id: "2",
    title: "Office",
    label: "Work",
    addressLine1: "456 BKC, Tower A, Floor 12",
    addressLine2: "Mumbai, Maharashtra - 400051",
    phone: "+91 9876543210",
    isDefault: false,
  },
];

export default function SavedAddressesPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
            Saved Addresses
          </h1>

          <button className="rounded-full bg-[#1F3D2B] px-4 py-2 text-sm font-medium text-white transition active:scale-95">
            + Add Address
          </button>
        </div>

        {/* Address List */}
        {mockAddresses.map((address) => (
          <div
            key={address.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              
              {/* Left */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EFEA]">
                  <MapPin className="h-5 w-5 text-neutral-700" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {address.title}
                    </p>

                    {address.isDefault && (
                      <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500">
                    {address.label}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="text-neutral-500 hover:text-neutral-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Address Details */}
            <div className="mt-3 space-y-1 text-sm text-neutral-600">
              <p>{address.addressLine1}</p>
              <p>{address.addressLine2}</p>
              <p>Phone: {address.phone}</p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
