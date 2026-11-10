'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GovIcon } from './ui/GovIcon';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SupportedLanguage } from '../lib/translations';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'ur', label: 'Urdu', native: 'اردو' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[1];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0] border-b border-[#D5CEBF] shadow-xs">
      {/* Editorial Dateline & Masthead Bar */}
      <div className="bg-[#0F1E36] text-[#FAF6F0] text-[11px] font-mono border-b border-[#0A1424] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#14B8A6] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
              GAZETTE // VOL. 2026
            </span>
            <span className="text-[#475569] hidden sm:inline">|</span>
            <span className="text-[#CBD5E1] hidden sm:inline">
              PUBLIC REGISTER FOR CITIZEN ASSISTANCE
            </span>
            <span className="text-[#475569] hidden md:inline">|</span>
            <span className="text-[#94A3B8] hidden md:inline">
              KARNATAKA INITIAL JURISDICTION
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#94A3B8]">
            <span className="hidden sm:inline text-[#14B8A6]">RULE-BASED DETERMINISTIC ENGINE</span>
            <span className="hidden sm:inline">•</span>
            <span>ZERO DATA MISUSE GUARANTEE</span>
          </div>
        </div>
      </div>

      {/* Main Masthead Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded bg-[#0F1E36] text-[#FDFBF7] flex items-center justify-center border border-[#1E3A66] shadow-xs transition-transform group-hover:scale-[1.02]">
              <GovIcon name="emblem" className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#0F1E36]">
                  JAN SETU AI
                </span>
                <span className="text-xs font-serif font-bold text-[#0F766E] border-l border-[#D5CEBF] pl-2">
                  ಜನ ಸೇತು
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-[#64748B] uppercase -mt-0.5 font-medium">
                Official Citizen Assistance Platform
              </p>
            </div>
          </Link>

          {/* Editorial Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                pathname === '/' ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
              }`}
            >
              {t.navHome}
            </Link>

            <Link
              href="/schemes"
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                pathname?.startsWith('/schemes') ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
              }`}
            >
              {t.navSchemes}
            </Link>

            <Link
              href="/assistant"
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                pathname === '/assistant' ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
              }`}
            >
              <span className="flex items-center gap-1">
                <GovIcon name="help-circle" className="w-3.5 h-3.5 text-[#0D9488]" />
                {t.navAssistant}
              </span>
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                    pathname === '/dashboard' ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
                  }`}
                >
                  {t.navDashboard}
                </Link>

                <Link
                  href="/documents"
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                    pathname === '/documents' ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
                  }`}
                >
                  {t.navDocuments}
                </Link>

                <Link
                  href="/applications"
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                    pathname === '/applications' ? 'text-[#0D9488] bg-[#F3EFE6] border border-[#E2DCCE]' : 'text-[#0F1E36] hover:bg-[#F3EFE6]'
                  }`}
                >
                  {t.navApplications}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-bold transition-colors ${
                      pathname?.startsWith('/admin') ? 'text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA]' : 'text-[#991B1B] hover:bg-[#FEE2E2]'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <GovIcon name="lock" className="w-3.5 h-3.5" />
                      {t.navAdmin}
                    </span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Items: Language & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-[#0F1E36] bg-[#FDFBF7] border border-[#D5CEBF] rounded hover:bg-[#F3EFE6] transition-colors"
                aria-expanded={langDropdownOpen}
              >
                <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                <span>{currentLang.native}</span>
                <GovIcon name="chevron-down" className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-[#FDFBF7] border border-[#D5CEBF] rounded shadow-lg py-1 z-50">
                  <div className="px-3 py-1 border-b border-[#ECE7DC] text-[10px] font-mono text-[#64748B] uppercase">
                    Select Language
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F3EFE6] transition-colors ${
                        language === lang.code ? 'font-bold text-[#0D9488] bg-[#F0FDFA]' : 'text-[#0F1E36]'
                      }`}
                    >
                      <span className="font-semibold">{lang.native}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-[#D5CEBF] pl-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F1E36] truncate max-w-[130px] font-mono">{user.full_name}</p>
                  <p className="text-[10px] text-[#0D9488] uppercase font-mono font-semibold tracking-wider">{user.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  {t.navSignOut}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-[#D5CEBF] pl-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-mono text-xs uppercase">
                    {t.navSignIn}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" className="font-mono text-xs uppercase font-bold">
                    {t.navGetStarted}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                const nextLang: Record<SupportedLanguage, SupportedLanguage> = {
                  en: 'kn',
                  kn: 'hi',
                  hi: 'ur',
                  ur: 'en'
                };
                setLanguage(nextLang[language]);
              }}
              className="text-xs px-2.5 py-1 bg-[#FDFBF7] border border-[#D5CEBF] rounded font-bold text-[#0F1E36] font-mono"
            >
              {currentLang.native}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-[#0F1E36] hover:bg-[#F3EFE6]"
              aria-label="Toggle menu"
            >
              <GovIcon name={mobileMenuOpen ? 'x-mark' : 'filter'} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D5CEBF] bg-[#FAF6F0] px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0F1E36] hover:bg-[#F3EFE6]"
          >
            {t.navHome}
          </Link>
          <Link
            href="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0F1E36] hover:bg-[#F3EFE6]"
          >
            {t.navSchemes}
          </Link>
          <Link
            href="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0D9488] hover:bg-[#F3EFE6]"
          >
            {t.navAssistant}
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0F1E36] hover:bg-[#F3EFE6]"
              >
                {t.navDashboard}
              </Link>
              <Link
                href="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0F1E36] hover:bg-[#F3EFE6]"
              >
                {t.navDocuments}
              </Link>
              <Link
                href="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#0F1E36] hover:bg-[#F3EFE6]"
              >
                {t.navApplications}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-xs font-mono font-bold uppercase text-[#B91C1C] hover:bg-[#FEE2E2]"
                >
                  {t.navAdmin}
                </Link>
              )}
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  {t.navSignOut}
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono text-xs uppercase">{t.navSignIn}</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full font-mono text-xs uppercase font-bold">{t.navGetStarted}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
