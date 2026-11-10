'use client';

import React from 'react';
import Link from 'next/link';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="verified">Public Interest GovTech</Badge>
          <span className="text-xs text-[#858585]">
            Karnataka Jurisdiction & National Scalability
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          About Jan Setu AI (ಜನ सेतु)
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          Bridging the gap between Indian citizens and public welfare entitlements through accessible, verified, and respectful technology.
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#111111] border-b border-[#E5E5E5] pb-3">
          <GovIcon name="shield-check" className="w-5 h-5 text-[#111111]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Foundational Principle
          </h2>
        </div>
        <p className="text-lg sm:text-xl font-semibold text-[#111111] leading-snug">
          "We do not replace government portals. We make them easier for ordinary citizens to understand and use."
        </p>
        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          Public welfare policies in India provide vital life-changing assistance: scholarships for students, pensions for widows and seniors, monthly cash support for women heads of household, input subsidies for farmers, and healthcare coverage. Yet, navigating complex department websites, confusing terminology, and unclear document rules often creates severe barriers for ordinary citizens.
        </p>
      </div>

      {/* Mission Pillars (2 columns layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            01 / Audited Data
          </span>
          <h3 className="font-semibold text-[#111111] text-base">
            Verified & Audited Information
          </h3>
          <p className="text-[#555555] leading-relaxed text-xs">
            Every scheme indexed in Jan Setu references its official department URL, policy circular number, and exact verification date. We never fabricate eligibility rules or invent welfare programs.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            02 / Deterministic Engine
          </span>
          <h3 className="font-semibold text-[#111111] text-base">
            Deterministic Eligibility Evaluation
          </h3>
          <p className="text-[#555555] leading-relaxed text-xs">
            Generative AI explains terms and answers citizen inquiries in plain speech, while our deterministic rules engine evaluates statutory conditions line-by-line so citizens receive 100% transparent decisions.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            03 / Citizen Agency
          </span>
          <h3 className="font-semibold text-[#111111] text-base">
            Citizen Agency & Explicit Consent
          </h3>
          <p className="text-[#555555] leading-relaxed text-xs">
            Extracted document details are never committed silently. The citizen inspects, verifies, and explicitly approves every field before application preparation or portal handoff.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            04 / Multilingual Support
          </span>
          <h3 className="font-semibold text-[#111111] text-base">
            Multilingual by Design
          </h3>
          <p className="text-[#555555] leading-relaxed text-xs">
            Built natively with Kannada (ಕನ್ನಡ), Hindi (हिंदी), Urdu (اردو), and English support, including real-time speech-to-text input for citizens with limited digital literacy.
          </p>
        </div>
      </div>

      {/* State Expansion Road Map */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2 text-xs sm:text-sm">
        <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
          Architectural Scope
        </span>
        <h3 className="text-base font-semibold text-[#111111]">
          Karnataka Initial Launch & Central Extensibility
        </h3>
        <p className="text-[#555555] leading-relaxed text-xs">
          Jan Setu launches initially focused on Karnataka, supporting critical state flagship programs (SSP Post-Matric, Gruha Lakshmi, Yuva Nidhi, Raitha Siri, Arogya Karnataka, Anna Bhagya, Vidyasiri) alongside National MSME and Central initiatives (PM Vishwakarma, PM-KISAN). The platform architecture is modularly designed to scale across additional Indian states.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <Link href="/schemes">
          <Button variant="primary" size="md">
            Explore Government Schemes &rarr;
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" size="md">
            Contact Citizen Helpdesk
          </Button>
        </Link>
      </div>
    </div>
  );
}
