// components/PaymentStatusBadge.js - Ultimate Version
'use client';

import { useState } from 'react';
import { 
  DollarSign, Clock, XCircle, RotateCcw, 
  CheckCircle2, AlertCircle, Wallet
} from 'lucide-react';

const STATUS_CONFIG = {
  paid: {
    label: 'Paid',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-100',
    shadow: 'shadow-emerald-200/50',
    description: 'Payment has been received',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    gradient: 'from-emerald-500 to-green-500'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-100',
    shadow: 'shadow-amber-200/50',
    description: 'Waiting for payment',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    gradient: 'from-amber-500 to-yellow-500'
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    hoverBg: 'hover:bg-rose-100',
    shadow: 'shadow-rose-200/50',
    description: 'Payment could not be processed',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    gradient: 'from-rose-500 to-red-500'
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-100',
    shadow: 'shadow-blue-200/50',
    description: 'Payment has been refunded',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    gradient: 'from-blue-500 to-indigo-500'
  }
};

export default function PaymentStatusBadge({ status, size = 'md', showTooltip = true }) {
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <div className="relative inline-flex">
      {/* Badge */}
      <span
        onMouseEnter={() => setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
        className={`
          inline-flex items-center ${sizeClasses[size]}
          rounded-full font-semibold
          ${config.bg} ${config.text} ${config.border}
          border shadow-sm ${config.shadow}
          transition-all duration-300
          ${config.hoverBg}
          hover:shadow-md hover:scale-[1.02]
          cursor-pointer
        `}
      >
        {/* Animated dot */}
        <span className={`relative flex ${dotSize[size]}`}>
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 animate-ping`}></span>
          <span className={`relative inline-flex rounded-full ${dotSize[size]} ${config.dot}`}></span>
        </span>
        
        {/* Icon */}
        <span className={`${iconSize[size]} ${config.text}`}>
          <Icon className={`${iconSize[size]} ${config.text}`} />
        </span>
        
        {/* Label */}
        <span className="tracking-wide">{config.label}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3 h-3" />
            {config.description}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}