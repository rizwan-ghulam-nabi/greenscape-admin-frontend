// app/admin/dashboard/settings/general/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings, Store, Mail, DollarSign, Clock, 
  Power, Bell, Save, CheckCircle2, Loader2
} from 'lucide-react';
import { ToggleSwitch, IconSelect } from '@/components/AdminSettingsUI';

export default function GeneralSettingsPage() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: 'GreenScape',
    storeEmail: 'support@greenscape.com',
    currency: 'PKR - Pakistani Rupee',
    timezone: 'Asia/Karachi',
    maintenance: false,
    notifications: true,
  });

  const toggleSwitch = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      console.log('Saving general settings:', formData);
      setLoading(false);
      setShowToast(true);
      // Auto-hide toast after 4 seconds
      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#021a12] relative overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 md:py-10 text-gray-200 font-sans">
      
      {/* --- BACKGROUND AMBIENT GLOW --- */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ade80]/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4ade80]/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      {/* --- TOAST NOTIFICATION --- */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#062820] border border-[#4ade80]/40 rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Settings Saved</p>
            <p className="text-xs text-gray-400">Your general settings have been updated successfully.</p>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="relative z-10 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your store configuration, payments, and delivery options.</p>
      </div>

      {/* --- SETTINGS TABS NAVIGATION --- */}
      <div className="relative z-10 flex flex-wrap gap-2 md:gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
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
                flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize whitespace-nowrap
                ${isActive 
                  ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]' 
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
      {/* 🛠️ FIX: Changed from max-w-5xl to max-w-7xl to fill wide screens gracefully */}
      <div className="relative z-10 w-full max-w-7xl mx-auto bg-[#062820]/90 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl hover:border-[#4ade80]/20 transition-colors duration-500">
        
        {/* Card Header */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div className="w-14 h-14 bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/10 rounded-2xl flex items-center justify-center border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
            <Settings className="w-7 h-7 text-[#4ade80]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">General Settings</h2>
            <p className="text-sm text-gray-400">Configure your store basics</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Store Information */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#4ade80] rounded-full"></span>
              Store Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                  <Store className="w-3.5 h-3.5" /> Store Name
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full bg-[#0a2a1a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Store Email
                </label>
                <input
                  type="email"
                  value={formData.storeEmail}
                  onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                  className="w-full bg-[#0a2a1a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Currency
                </label>
                <IconSelect
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={['PKR - Pakistani Rupee', 'USD - US Dollar', 'EUR - Euro']}
                  icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </label>
                <IconSelect
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={['Asia/Karachi', 'UTC', 'America/New_York']}
                  icon={<Clock className="w-4 h-4 text-gray-400" />}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#4ade80] rounded-full"></span>
              Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0a2a1a] border border-white/5 rounded-xl p-4 md:p-5 hover:bg-[#0d2f20] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Power className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Maintenance Mode</p>
                    <p className="text-xs text-gray-400">Temporarily disable store</p>
                  </div>
                </div>
                <ToggleSwitch checked={formData.maintenance} onChange={() => toggleSwitch('maintenance')} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0a2a1a] border border-white/5 rounded-xl p-4 md:p-5 hover:bg-[#0d2f20] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Enable Notifications</p>
                    <p className="text-xs text-gray-400">Receive important updates</p>
                  </div>
                </div>
                <ToggleSwitch checked={formData.notifications} onChange={() => toggleSwitch('notifications')} />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`
              w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all duration-300
              bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-[#021a12]
              hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:scale-[1.01]
              active:scale-[0.98]
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}