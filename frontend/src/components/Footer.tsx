'use client';

import React from 'react';
import Link from 'next/link';
import { GovIcon } from './ui/GovIcon';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0F1E36] text-[#E2DCCE] border-t border-[#1E3A66] mt-24">
      {/* Official Clarification Banner */}
      <div className="bg-[#0A1424] border-b border-[#1E3A66] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 text-[#14B8A6] flex-shrink-0">
              <GovIcon name="shield-check" className="w-4 h-4" />
            </div>
            <span className="font-mono text-[11px]">
              <strong className="text-white">STATUTORY MANDATE:</strong> We do not replace government portals. We make them easier for ordinary citizens to understand and use.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#64748B]">
            KARNATAKA INITIAL STATE // NATIONAL EXTENSIBLE ARCHITECTURE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Identity & Colophon */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#162B4D] text-[#14B8A6] flex items-center justify-center border border-[#1E3A66]">
                <GovIcon name="emblem" className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-serif text-lg font-bold text-white tracking-tight block">JAN SETU AI</span>
                <span className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase">ಜನ सेतु &bull; PUBLIC GOVTECH</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Intelligent citizen-assistance platform simplifying access to Indian public services through verified rules, computer vision document assistance, and respectful technology.
            </p>
            <div className="pt-1 font-mono text-[10px] text-[#64748B] leading-relaxed">
              Karnataka Regional Coverage: Bengaluru, Mysuru, Dharwad, Kalaburagi, Mangaluru, Belagavi, Ballari, Shivamogga.
            </div>
          </div>

          {/* Col 2: Karnataka Schemes */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#14B8A6] block">
              [ DIRECTORY // KARNATAKA ]
            </span>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li><Link href="/schemes?q=SSP" className="hover:text-[#14B8A6] transition-colors">SSP Post-Matric Scholarship</Link></li>
              <li><Link href="/schemes?q=Gruha" className="hover:text-[#14B8A6] transition-colors">Gruha Lakshmi Scheme</Link></li>
              <li><Link href="/schemes?q=Yuva" className="hover:text-[#14B8A6] transition-colors">Yuva Nidhi Scheme</Link></li>
              <li><Link href="/schemes?q=Raitha" className="hover:text-[#14B8A6] transition-colors">Raitha Siri (Agriculture)</Link></li>
              <li><Link href="/schemes?q=Arogya" className="hover:text-[#14B8A6] transition-colors">Arogya Karnataka (Health)</Link></li>
              <li><Link href="/schemes?q=Anna" className="hover:text-[#14B8A6] transition-colors">Anna Bhagya Food Security</Link></li>
            </ul>
          </div>

          {/* Col 3: Assistance & Features */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#14B8A6] block">
              [ CITIZEN ASSISTANCE ]
            </span>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li><Link href="/assistant" className="hover:text-[#14B8A6] transition-colors">Ask Jan Setu (Voice & Multilingual)</Link></li>
              <li><Link href="/schemes" className="hover:text-[#14B8A6] transition-colors">Scheme Search & Statutory Filters</Link></li>
              <li><Link href="/documents" className="hover:text-[#14B8A6] transition-colors">Computer Vision Document Scanner</Link></li>
              <li><Link href="/eligibility" className="hover:text-[#14B8A6] transition-colors">Deterministic Rules Engine</Link></li>
              <li><Link href="/applications" className="hover:text-[#14B8A6] transition-colors">Case Dossier & Reference Register</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#14B8A6] block">
              [ STATUTORY TRUST ]
            </span>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li><Link href="/about" className="hover:text-[#14B8A6] transition-colors">About Jan Setu & Citizen Charter</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[#14B8A6] transition-colors">Government Sources Disclaimer</Link></li>
              <li><Link href="/privacy" className="hover:text-[#14B8A6] transition-colors">Privacy & Data-Use Consent</Link></li>
              <li><Link href="/terms" className="hover:text-[#14B8A6] transition-colors">Terms of Public Service</Link></li>
              <li><Link href="/accessibility" className="hover:text-[#14B8A6] transition-colors">Accessibility Statement (WCAG AA)</Link></li>
              <li><Link href="/contact" className="hover:text-[#14B8A6] transition-colors">Citizen Support & Feedback</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="border-t border-[#1E3A66] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p className="font-mono text-[11px]">
            &copy; 2026 JAN SETU AI (जन सेतु) &bull; DEDICATED TO CITIZEN EMPOWERMENT & GOVTECH TRANSPARENCY
          </p>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span>WCAG 2.2 AA TARGET</span>
            <span>&bull;</span>
            <span>ಕನ್ನಡ &bull; हिंदी &bull; ENGLISH &bull; اردو</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
