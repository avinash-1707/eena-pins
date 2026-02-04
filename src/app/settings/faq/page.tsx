import { HelpCircle, ChevronDown } from "lucide-react";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  title: string;
  items: FAQItem[];
};

const mockFAQs: FAQCategory[] = [
  {
    id: "shipping",
    title: "Shipping",
    items: [
      {
        id: "s1",
        question: "What are the delivery charges?",
        answer: "Delivery charges depend on your location and will be calculated at checkout.",
      },
      {
        id: "s2",
        question: "How long does delivery take?",
        answer: "Orders are typically delivered within 3–7 business days.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    items: [
      {
        id: "r1",
        question: "What is your return policy?",
        answer: "You can return products within 7 days of delivery if unused and in original packaging.",
      },
      {
        id: "r2",
        question: "How do I initiate a return?",
        answer: "Go to your orders page and select the item you wish to return.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        id: "p1",
        question: "What payment methods do you accept?",
        answer: "We accept credit cards, debit cards, UPI, and net banking.",
      },
      {
        id: "p2",
        question: "Is my payment information secure?",
        answer: "Yes, all payment information is encrypted and securely stored.",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    items: [
      {
        id: "pr1",
        question: "Are your products sustainable?",
        answer: "Yes, we focus on sustainable sourcing and eco-friendly packaging.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "a1",
        question: "How do I change my password?",
        answer: "You can change your password from the account settings page.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          Frequently Asked Questions
        </h1>

        {/* FAQ Sections */}
        {mockFAQs.map((section) => (
          <div key={section.id} className="space-y-3">
            
            {/* Section Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <HelpCircle className="h-4 w-4" />
              {section.title}
            </div>

            {/* Questions */}
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <p className="text-sm text-neutral-900">
                  {item.question}
                </p>

                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </div>
            ))}
          </div>
        ))}

        {/* Help Card */}
        <div className="rounded-2xl bg-[#EFEAE4] p-6 text-center">
          <p className="text-sm font-medium text-neutral-900">
            Still need help?
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Our customer support team is here to assist you
          </p>

          <button className="mt-4 rounded-full bg-[#1F3D2B] px-6 py-2 text-sm font-medium text-white transition active:scale-95">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
