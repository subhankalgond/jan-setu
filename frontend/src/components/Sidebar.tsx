'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GovIcon } from './ui/GovIcon';
import { SupportedLanguage } from '../lib/translations';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'ur', label: 'Urdu', native: 'اردو' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      altHref: '/',
      icon: 'home' as const
    },
    {
      label: 'Find Schemes',
      href: '/schemes',
      icon: 'search' as const
    },
    {
      label: 'AI Assistant',
      href: '/assistant',
      icon: 'message' as const
    },
    {
      label: 'My Documents',
      href: '/documents',
      icon: 'document' as const
    },
    {
      label: 'My Applications',
      href: '/applications',
      icon: 'briefcase' as const
    }
  ];

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(item.href);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const sidebarContent = (
    <div className="w-[252px] min-w-[252px] h-full bg-[#FFFFFF] border-r border-[#E5E5E5] flex flex-col justify-between p-4 select-none">
      {/* Top Branding */}
      <div>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-start gap-3 py-2 px-1 rounded-lg hover:bg-[#F7F7F6] transition-colors"
        >
          {/* Emblem representation */}
          <div className="w-9 h-11 flex-shrink-0 text-[#111111] pt-0.5">
            <GovIcon name="national-emblem" className="w-8 h-10" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-[#111111] tracking-tight leading-none">
              Jan Setu AI
            </h1>
            <p className="text-[10px] text-[#858585] tracking-tight leading-tight">
              Sarkari Yojana, Ab Aapke Saath
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isNavActive(item);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#111111] text-[#FFFFFF]'
                    : 'text-[#111111] hover:bg-[#F7F7F6]'
                }`}
              >
                <GovIcon
                  name={item.icon}
                  className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Admin link if user is administrator */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith('/admin')
                  ? 'bg-[#111111] text-[#FFFFFF]'
                  : 'text-[#111111] hover:bg-[#F7F7F6]'
              }`}
            >
              <GovIcon
                name="shield-check"
                className={`w-5 h-5 flex-shrink-0 ${pathname?.startsWith('/admin') ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}
              />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#E5E5E5] pt-3 space-y-1">
        {/* Actual Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#F7F7F6] transition-colors"
          >
            <div className="flex items-center gap-3">
              <GovIcon name="globe" className="w-5 h-5 text-[#111111]" />
              <span>{currentLang.label}</span>
            </div>
            <GovIcon name="chevron-down" className="w-4 h-4 text-[#858585]" />
          </button>

          {langDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg shadow-lg py-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F7F7F6] ${
                    language === l.code ? 'font-bold text-[#111111] bg-[#F7F7F6]' : 'text-[#555555]'
                  }`}
                >
                  <span>{l.label}</span>
                  <span className="text-[11px] text-[#858585]">{l.native}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Citizen Profile Item */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#F7F7F6] transition-colors"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="w-7 h-7 rounded-full bg-[#E5E5E5] text-[#111111] flex items-center justify-center flex-shrink-0">
                <GovIcon name="user" className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-left truncate">
                <span className="block text-xs font-semibold text-[#111111] truncate">
                  {user ? user.full_name : 'Welcome, Citizen'}
                </span>
              </div>
            </div>
            <GovIcon name="chevron-down" className="w-4 h-4 text-[#858585] flex-shrink-0" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg shadow-lg p-2 z-50 text-xs space-y-1">
              {user ? (
                <>
                  <div className="px-2 py-1.5 border-b border-[#E5E5E5]">
                    <p className="font-bold text-[#111111] truncate">{user.full_name}</p>
                    <p className="text-[11px] text-[#858585] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F7F7F6] text-[#555555] font-mono capitalize">
                      {user.role} &bull; {user.state}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onClose?.();
                    }}
                    className="block px-2 py-1.5 rounded hover:bg-[#F7F7F6] text-[#111111]"
                  >
                    Dashboard Overview
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onClose?.();
                    }}
                    className="block px-2 py-1.5 rounded hover:bg-[#F7F7F6] text-[#555555]"
                  >
                    Terms & Conditions
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose?.();
                  }}
                  className="block px-2 py-1.5 rounded hover:bg-[#F7F7F6] font-semibold text-[#111111]"
                >
                  Sign In to Jan Setu
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Logout or Sign In */}
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#F7F7F6] transition-colors"
          >
            <GovIcon name="logout" className="w-5 h-5 text-[#111111]" />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            href="/auth/login"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#F7F7F6] transition-colors"
          >
            <GovIcon name="user" className="w-5 h-5 text-[#111111]" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 h-full flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

