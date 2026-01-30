import React from "react";
import Image from "next/image";
import { Menu, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 max-w-7xl mx-auto">
        {/* Left - Hamburger Menu */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center px-2">
          <Image
            src="/images/logo.png"
            alt="eena pins"
            width={100}
            height={32}
            priority
            className="object-contain w-24 sm:w-32 h-auto"
          />
        </div>

        {/* Right - Search Icon */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
          aria-label="Search"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default Header;
