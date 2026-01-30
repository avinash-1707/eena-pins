'use client';

import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: string) => {
    if (pathname === '/' && tab === 'home') return true;
    if (pathname === '/cart' && tab === 'cart') return true;
    if (pathname === '/profile' && tab === 'profile') return true;
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
            onClick={() => handleNavigation('/')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <Home 
              className={`w-6 h-6 mb-1 transition-colors ${
                isActive('home') 
                  ? 'text-gray-900 ' 
                  : 'text-gray-600'
              }`}
            />
            <span className={`text-xs transition-colors ${
              isActive('home') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-600 font-medium'
            }`}>
              Home
            </span>
          </button>

          {/* Cart */}
          <button
            onClick={() => handleNavigation('/cart')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <ShoppingBag 
              className={`w-6 h-6 mb-1 transition-colors ${
                isActive('cart') 
                  ? 'text-gray-900 fill-gray-900' 
                  : 'text-gray-600'
              }`}
            />
            <span className={`text-xs transition-colors ${
              isActive('cart') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-600 font-medium'
            }`}>
              Cart
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleNavigation('/profile')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
          >
            <User 
              className={`w-6 h-6 mb-1 transition-colors ${
                isActive('profile') 
                  ? 'text-gray-900 fill-gray-900' 
                  : 'text-gray-600'
              }`}
            />
            <span className={`text-xs transition-colors ${
              isActive('profile') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-600 font-medium'
            }`}>
              Profile
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};

export default BottomNav;