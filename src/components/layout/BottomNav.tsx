"use client";

import React from "react";
import { Home, ShoppingBag, User, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role; // "ADMIN" | "BRAND" | undefined

  const isActive = (tab: string) => {
    if (pathname === "/" && tab === "home") return true;
    if (pathname === "/cart" && tab === "cart") return true;
    if (pathname.startsWith("/profile") && tab === "profile") return true;
    if (pathname === "/dashboard" && tab === "dashboard") return true;
    if (pathname === "/brand-dashboard" && tab === "brand-dashboard")
      return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-xl rounded-full border border-white/30 px-6 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-around">
          {/* Home */}
          <button
            onClick={() => handleNavigation("/")}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <Home
              className={`w-6 h-6 mb-1 ${
                isActive("home") ? "text-gray-900" : "text-gray-600"
              }`}
            />
            <span
              className={`text-xs ${
                isActive("home")
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 font-medium"
              }`}
            >
              Home
            </span>
          </button>

          {/* Cart */}
          <button
            onClick={() => handleNavigation("/cart")}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <ShoppingBag
              className={`w-6 h-6 mb-1 ${
                isActive("cart")
                  ? "text-gray-900 fill-gray-900"
                  : "text-gray-600"
              }`}
            />
            <span
              className={`text-xs ${
                isActive("cart")
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 font-medium"
              }`}
            >
              Cart
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleNavigation("/profile/me")}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <User
              className={`w-6 h-6 mb-1 ${
                isActive("profile")
                  ? "text-gray-900 fill-gray-900"
                  : "text-gray-600"
              }`}
            />
            <span
              className={`text-xs ${
                isActive("profile")
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 font-medium"
              }`}
            >
              Profile
            </span>
          </button>

          {/* Dashboard (ADMIN / BRAND only) */}
          {role && (role === "ADMIN" || role === "BRAND") && (
            <button
              onClick={() =>
                handleNavigation(
                  role === "ADMIN" ? "/dashboard" : "/brand-dashboard",
                )
              }
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            >
              <LayoutDashboard
                className={`w-6 h-6 mb-1 ${
                  isActive(role === "ADMIN" ? "dashboard" : "brand-dashboard")
                    ? "text-gray-900"
                    : "text-gray-600"
                }`}
              />
              <span
                className={`text-xs ${
                  isActive(role === "ADMIN" ? "dashboard" : "brand-dashboard")
                    ? "text-gray-900 font-bold"
                    : "text-gray-600 font-medium"
                }`}
              >
                {role === "ADMIN" ? "Admin" : "Brand"}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
