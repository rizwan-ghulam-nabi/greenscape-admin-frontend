// app/admin/settings/payment/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings, DollarSign, Store, CreditCard, Save, 
  Copy, ShieldCheck
} from 'lucide-react';
import { ToggleSwitch, GatewayRow } from '@/components/AdminSettingsUI';

export default function PaymentSettingsPage() {
  const pathname = usePathname();

  const [gateways, setGateways] = useState({
    stripe: true,
    paypal: false,
    cashOnDelivery: true,
  });

  const toggleGateway = (key) => {
    setGateways(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log('Saving payment settings:', gateways);
    alert('Payment settings saved successfully!');
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
              href={`/admin/dashboard/settings/${tab.name}`}
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
            <CreditCard className="w-7 h-7 text-[#4ade80]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Settings</h2>
            <p className="text-sm text-gray-400">Manage payment methods</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Payment Gateways */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4">Payment Gateways</h3>
            <div className="space-y-3">
              <GatewayRow
                icon={<div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">S</div>}
                name="Stripe"
                desc="Secure online payments"
                checked={gateways.stripe}
                onToggle={() => toggleGateway('stripe')}
              />
              <GatewayRow
                icon={<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">P</div>}
                name="PayPal"
                desc="Online payments worldwide"
                checked={gateways.paypal}
                onToggle={() => toggleGateway('paypal')}
              />
              <GatewayRow
                icon={<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">$</div>}
                name="Cash on Delivery"
                desc="Pay when you receive"
                checked={gateways.cashOnDelivery}
                onToggle={() => toggleGateway('cashOnDelivery')}
              />
            </div>
          </div>

          {/* Stripe Configuration */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4">Stripe Configuration</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Publishable Key</label>
                <div className="relative bg-[#0a2a1a] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-white text-sm font-mono">pk_live_**************</span>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Secret Key</label>
                <div className="relative bg-[#0a2a1a] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-white text-sm font-mono">sk_live_**************</span>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 border border-[#4ade80]/20 bg-[#4ade80]/5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Your payment information is encrypted and secure.</p>
              <p className="text-xs text-gray-400">We never store your card details.</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#4ade80] text-[#021a12] py-4 rounded-xl font-bold text-sm hover:bg-[#22c55e] transition-colors shadow-lg shadow-[#4ade80]/20"
          >
            <Save className="w-4 h-4" />
            Update Payment Settings
          </button>
        </div>
      </div>
    </div>
  );
}