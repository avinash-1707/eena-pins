'use client';

import React from 'react';
import SettingsMenuItem from './SettingsMenuItem';
import { 
  MessageCircle, 
  MapPin, 
  Package, 
  CreditCard, 
  Bell, 
  Lock, 
  HelpCircle, 
  User 
} from 'lucide-react';

const menuItems = [
  { id: 'message', icon: MessageCircle, label: 'Message', route: '/settings/message' },
  { id: 'addresses', icon: MapPin, label: 'Addresses', route: '/settings/addresses' },  // ✅ Matches folder
  { id: 'orders', icon: Package, label: 'Order History', route: '/settings/orders' },  // ✅ Matches folder
  { id: 'payment', icon: CreditCard, label: 'Payment Methods', route: '/settings/payment-methods' },  // ✅ Matches folder
  { id: 'notifications', icon: Bell, label: 'Notifications', route: '/settings/notifications', badge: 3 },
  { id: 'security', icon: Lock, label: 'Security', route: '/settings/security' },  // ✅ Matches folder
  { id: 'faq', icon: HelpCircle, label: 'FAQs & Help', route: '/settings/faq' },  // ✅ Matches folder
  { id: 'account', icon: User, label: 'Account', route: '/settings/account' },  // ✅ Matches folder
];

const SettingsMenuList = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden divide-y divide-gray-100">
      {menuItems.map((item) => (
        <SettingsMenuItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          route={item.route}
          badge={item.badge}
        />
      ))}
    </div>
  );
};

export default SettingsMenuList;