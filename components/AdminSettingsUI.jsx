// components/AdminSettingsUI.jsx
'use client';

import { ChevronDown } from 'lucide-react';

// Custom Toggle Switch (Matches the design)
export function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
        ${checked ? 'bg-[#4ade80]' : 'bg-white/20'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// Payment Gateway Row Component
export function GatewayRow({ icon, name, desc, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-[#0a2a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onToggle} />
    </div>
  );
}

// Shipping Method Row Component
export function ShippingRow({ icon, name, desc, price, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-[#0a2a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-white">{price}</span>
        <ToggleSwitch checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
}

// Custom Select with Icon
export function IconSelect({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#0a2a1a] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white appearance-none focus:outline-none focus:border-[#4ade80] transition-colors"
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}