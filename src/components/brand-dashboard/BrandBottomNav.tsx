"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, User, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/brand-dashboard", label: "Products", icon: Package },
  { href: "/brand-dashboard/payout", label: "Orders", icon: ShoppingCart },
  { href: "/brand-dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/brand-dashboard/profile", label: "Profile", icon: User },
] as const;

export function BrandBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-4xl rounded-t-2xl border-t border-gray-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md supports-backdrop-filter:bg-white/80"
      aria-label="Brand dashboard navigation"
    >
      <div className="flex items-center justify-around px-2 py-3 sm:px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/brand-dashboard"
              ? pathname === "/brand-dashboard" ||
                pathname.startsWith("/brand-dashboard/products")
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors sm:px-6 ${
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  isActive ? "stroke-[2.5]" : ""
                }`}
                aria-hidden
              />
              <span className="text-xs font-medium sm:text-sm">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
