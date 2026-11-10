'use client';

import React from 'react';
import Link from 'next/link';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="verified">Official Source Transparency</Badge>
          <span className="text-xs text-[#858585]">Statutory Disclosure</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          Government Sources & Disclaimer
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          Important disclosures regarding our role, official government sources, and deterministic eligibility evaluations.
        </p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-[#555555] leading-relaxed">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-3">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            01 / Platform Role
          </span>
          <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
            <GovIcon name="shield-check" className="w-5 h-5 text-[#111111]" />
            Independent Citizen-Assistance Platform
          </h2>
          <p className="text-xs text-[#555555]">
            Jan Setu AI (ಜನ ಸೇತು) is an independent public-interest GovTech platform designed to help citizens understand and prepare for public welfare schemes. <strong className="text-[#111111]">Jan Setu is not an official government agency, department, or statutory authority.</strong>
          </p>
          <p className="text-xs text-[#555555]">
            We do not claim official government endorsement, partnership, or affiliation unless authorized under a specific program. Our service sits between citizens and existing official portals to provide guidance, translation, and application readiness.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            02 / Official Sources
          </span>
          <h2 className="text-base font-semibold text-[#111111]">
            Source Information Verification
          </h2>
          <p className="text-xs text-[#555555]">
            All scheme guidelines, eligibility conditions, and benefit structures published on Jan Setu are gathered from publicly accessible official government repositories (such as ssp.postmatric.karnataka.gov.in, sevasindhuservices.karnataka.gov.in, fruits.karnataka.gov.in, and pmvishwakarma.gov.in). Each scheme record prominently displays its source department URL and last-verified audit date.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
            03 / Preliminary Evaluations
          </span>
          <h2 className="text-base font-semibold text-[#111111]">
            Preliminary Eligibility Scope
          </h2>
          <p className="text-xs text-[#555555]">
            Eligibility results presented on Jan Setu represent automated preliminary assessments calculated against published criteria. Final sanctions, disbursement approvals, and benefit disbursements are exclusively governed by designated government officers and portals.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link href="/schemes">
          <Button variant="primary" size="md">
            Explore Government Schemes &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}
