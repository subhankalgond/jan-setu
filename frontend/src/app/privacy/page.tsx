'use client';

import React from 'react';
import Link from 'next/link';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="verified">Data Protection Policy</Badge>
          <span className="text-xs text-[#858585]">Updated: 2026</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          Privacy Policy & Data Disclosure
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          A concise, transparent statement of how Jan Setu handles your personal information, certificate files, and identity records.
        </p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-[#555555] leading-relaxed">
        {/* Section 1 */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            01 / Purpose of Processing
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="shield-check" className="w-4 h-4 text-[#15803D]" />
            Why We Process Citizen Information
          </h2>
          <p className="text-xs text-[#555555]">
            Jan Setu AI processes citizen data solely to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#555555] pl-2 text-xs">
            <li>Evaluate eligibility against verified government scheme rules (income, age, course enrollment, domicile).</li>
            <li>Inspect document quality using Computer Vision (detecting blurriness and cut-off margins).</li>
            <li>Extract certificate identifiers (such as Karnataka Nadakacheri RD numbers) for your explicit review.</li>
            <li>Prepare organized checklists for official government portal submission.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            02 / Minimal Data
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="user" className="w-4 h-4 text-[#15803D]" />
            Minimal Necessary Data Collection
          </h2>
          <p className="text-xs text-[#555555]">
            We strictly limit data collection to what is necessary. We do not require Aadhaar numbers to explore schemes, check preliminary eligibility, or receive guidance. Where identity details are extracted from uploaded certificates, they remain in your private vault under your explicit control.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            03 / Document Storage
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="document" className="w-4 h-4 text-[#15803D]" />
            Secure Storage & Cryptographic Passwords
          </h2>
          <p className="text-xs text-[#555555]">
            Uploaded certificates are stored with randomized UUID filenames outside web-accessible roots. All citizen passwords are cryptographically hashed using the memory-hard Argon2id standard. Multi-tenant document authorization rules ensure no citizen can view another citizen's files.
          </p>
        </div>
      </div>
    </div>
  );
}
