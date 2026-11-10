'use client';

import React, { useState, useEffect } from 'react';
import { GovIcon } from './ui/GovIcon';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    // Generate dynamic date in client locale: "Tue, Nov 10, 2026"
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setCurrentDateFormatted(formatted);
  }, []);

  return (
    <header className="h-[72px] sm:h-[80px] bg-[#FFFFFF] border-b border-[#E5E5E5] flex items-center justify-between px-4 sm:px-8 z-20 flex-shrink-0">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Drawer"
          className="p-2 rounded-lg text-[#111111] hover:bg-[#F7F7F6] border border-[#E5E5E5]"
        >
          <GovIcon name="menu" className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-[#111111]">Jan Setu AI</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right Side: Calendar & Dynamic Date */}
      <div className="flex items-center gap-2 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs font-medium text-[#111111]">
        <GovIcon name="calendar" className="w-4 h-4 text-[#555555]" />
        <span>{currentDateFormatted || 'Loading date...'}</span>
      </div>
    </header>
  );
};

