'use client';

import React from 'react';
import Link from 'next/link';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="verified">Accessibility Standards</Badge>
          <span className="text-xs text-[#858585]">WCAG 2.2 AA Compliance</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          Accessibility Statement
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          Our commitment to ensuring Jan Setu is usable by every Indian citizen regardless of physical ability, device constraints, or digital literacy.
        </p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-[#555555] leading-relaxed">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            01 / Keyboard Access
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="check" className="w-4 h-4 text-[#15803D]" />
            Keyboard Navigation & Focus Indicators
          </h2>
          <p className="text-xs text-[#555555]">
            All interactive elements—including navigation links, buttons, modal dialogs, and form inputs—are fully accessible via keyboard. Visible focus indicators assist citizens using tab-based navigation.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            02 / High Contrast
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="eye" className="w-4 h-4 text-[#15803D]" />
            High Contrast & Color Independence
          </h2>
          <p className="text-xs text-[#555555]">
            Color choices are rigorously selected to exceed WCAG 2.2 AA contrast standards. Crucially, information is never conveyed by color alone: status indicators pair color with explicit text labels ("Satisfied", "Missing Data", "Condition Failed").
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            03 / Voice Interaction
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="microphone" className="w-4 h-4 text-[#15803D]" />
            Voice Input for First-Time Internet Users
          </h2>
          <p className="text-xs text-[#555555]">
            Recognizing that many Indian citizens are first-time smartphone users or prefer spoken inquiry over typing, Jan Setu includes native speech-to-text input supporting Kannada, Hindi, English, and Urdu.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            04 / Screen Readers
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="document" className="w-4 h-4 text-[#15803D]" />
            Screen Reader Compatibility & Semantic HTML
          </h2>
          <p className="text-xs text-[#555555]">
            We utilize standard semantic elements (`header`, `main`, `footer`, `nav`, headings, `button`, `form`) with ARIA labels and landmarks for seamless compatibility with screen readers like NVDA, JAWS, and TalkBack.
          </p>
        </div>
      </div>
    </div>
  );
}
