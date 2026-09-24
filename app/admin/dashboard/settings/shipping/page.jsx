// app/admin/settings/shipping/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings, DollarSign, Store, Truck, Save, 
  Package, Zap, Gift, MapPin
} from 'lucide-react';
import { ToggleSwitch, ShippingRow, IconSelect } from '@/components/AdminSettingsUI';

export default function ShippingSettingsPage() {
  const pathname = usePathname();

  const [shipping, setShipping] = useState({
    enableShipping: true,
    standardDelivery: true,
    expressDelivery: true,
    freeShipping: true,
    zone: 'Pakistan',
  });

  const toggleShipping = (key) => {
    setShipping(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log('Saving shipping settings:', shipping);
    alert('Shipping settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-[#021a12] p-6 md:p-10 text-gray-200 font-sans">
      
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your store configuration, payments, and delivery options.</p>
      </div>

      {/* --- SETTINGS TABS NAVIGATION --- */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
        {[
          { name: 'general', label: 'General', icon: Settings },
          { name: 'payment', label: 'Payment', icon: DollarSign },
          { name: 'shipping', label: 'Shipping', icon: Store },
        ].map((tab) => {
          const isActive = pathname === `/admin/dashboard/settings/${tab.name}`;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={`/admin//dashboard/settings/${tab.name}`}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize
                ${isActive 
                  ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 shadow-[0_0_15px_rgba(74,222,128,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* --- CONTENT CARD --- */}
      <div className="max-w-4xl mx-auto bg-[#062820] border border-white/5 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#4ade80]/10 rounded-2xl flex items-center justify-center border border-[#4ade80]/30">
            <Truck className="w-7 h-7 text-[#4ade80]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Shipping Settings</h2>
            <p className="text-sm text-gray-400">Manage delivery options</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Enable Shipping */}
          <div className="flex items-center justify-between bg-[#0a2a1a] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-white">Enable Shipping</p>
                <p className="text-xs text-gray-400">Allow customers to choose delivery</p>
              </div>
            </div>
            <ToggleSwitch checked={shipping.enableShipping} onChange={() => toggleShipping('enableShipping')} />
          </div>

          {/* Shipping Methods */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4">Shipping Methods</h3>
            <div className="space-y-3">
              <ShippingRow
                icon={<Package className="w-5 h-5 text-yellow-400" />}
                name="Standard Delivery"
                desc="3-5 business days"
                price="Rs. 200"
                checked={shipping.standardDelivery}
                onToggle={() => toggleShipping('standardDelivery')}
              />
              <ShippingRow
                icon={<Zap className="w-5 h-5 text-yellow-400" />}
                name="Express Delivery"
                desc="1-2 business days"
                price="Rs. 400"
                checked={shipping.expressDelivery}
                onToggle={() => toggleShipping('expressDelivery')}
              />
              <ShippingRow
                icon={<Gift className="w-5 h-5 text-yellow-400" />}
                name="Free Shipping"
                desc="Orders above Rs. 5,000"
                price="Free"
                checked={shipping.freeShipping}
                onToggle={() => toggleShipping('freeShipping')}
              />
            </div>
          </div>

          {/* Shipping Zones */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4">Shipping Zones</h3>
            <div className="flex flex-col gap-1.5">
              <IconSelect
                value={shipping.zone}
                onChange={(e) => setShipping({ ...shipping, zone: e.target.value })}
                options={['Pakistan', 'India', 'UAE', 'USA']}
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#4ade80] text-[#021a12] py-4 rounded-xl font-bold text-sm hover:bg-[#22c55e] transition-colors shadow-lg shadow-[#4ade80]/20"
          >
            <Save className="w-4 h-4" />
            Save Shipping Settings
          </button>
        </div>
      </div>
    </div>
  );
}