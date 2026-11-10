import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verified' | 'pending' | 'error' | 'neutral' | 'karnataka' | 'central' | 'editorial';
  className?: string;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
  withDot = true
}) => {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium';

  const dotColors = {
    verified: 'bg-[#15803D]',
    pending: 'bg-[#B45309]',
    error: 'bg-[#DC2626]',
    neutral: 'bg-[#858585]',
    karnataka: 'bg-[#111111]',
    central: 'bg-[#555555]',
    editorial: 'bg-white'
  };

  const variants = {
    verified: 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]',
    pending: 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]',
    error: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]',
    neutral: 'bg-[#F7F7F6] text-[#555555] border border-[#E5E5E5]',
    karnataka: 'bg-[#F7F7F6] text-[#111111] border border-[#E5E5E5]',
    central: 'bg-[#F7F7F6] text-[#111111] border border-[#E5E5E5]',
    editorial: 'bg-[#111111] text-white border border-[#111111]'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))}>
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} flex-shrink-0`} />
      )}
      {children}
    </span>
  );
};
