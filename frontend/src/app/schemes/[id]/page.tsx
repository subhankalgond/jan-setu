'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';
import { GovIcon } from '../../../components/ui/GovIcon';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function SchemeDetailPage() {
  const params = useParams();
  const schemeId = params.id as string;
  const { language } = useLanguage();

  const [scheme, setScheme] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!schemeId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getSchemeDetail(schemeId);
        setScheme(data);
      } catch (err: any) {
        setError(err.message || 'Could not load scheme record.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [schemeId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-3 text-xs">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#555555]">Loading verified scheme gazette entry...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4 text-xs">
        <GovIcon name="alert-triangle" className="w-10 h-10 text-[#DC2626] mx-auto" />
        <h2 className="text-xl font-bold text-[#111111]">Scheme Record Not Found</h2>
        <p className="text-[#555555]">{error || 'This scheme record may have been archived or is under review.'}</p>
        <div className="pt-2">
          <Link href="/schemes">
            <Button variant="outline" size="sm">Back to Schemes Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isKarnataka = scheme.government_level === 'karnataka';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs text-[#555555]">
        <Link href="/schemes" className="hover:text-[#111111] flex items-center gap-1 font-semibold">
          &larr; All Schemes
        </Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold truncate max-w-sm">{scheme.title}</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
          <div className="flex items-center gap-2">
            <Badge variant={isKarnataka ? 'karnataka' : 'central'}>
              {isKarnataka ? 'Karnataka State Jurisdiction' : 'Union Government'}
            </Badge>
            <Badge variant="verified">Official Source Verified</Badge>
          </div>
          <span className="font-mono text-xs font-semibold text-[#858585]">{scheme.code}</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-tight">
            {scheme.title}
          </h1>
          {scheme.kannada_title && (
            <p className="text-base font-bold text-[#555555] mt-1">{scheme.kannada_title}</p>
          )}
          <p className="text-xs text-[#555555] mt-1">{scheme.department}</p>
        </div>

        <div className="p-4 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl space-y-1">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
            Benefits Specification:
          </span>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
            {scheme.benefits_summary}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-wrap gap-3 items-center text-xs">
          <Link href={`/eligibility?scheme=${scheme.id}`}>
            <Button variant="primary" size="md">
              <GovIcon name="check" className="w-4 h-4 mr-1.5" />
              Check Eligibility
            </Button>
          </Link>

          <Link href={`/apply/${scheme.id}`}>
            <Button variant="secondary" size="md">
              <GovIcon name="document-check" className="w-4 h-4 mr-1.5" />
              Prepare Application
            </Button>
          </Link>

          <a
            href={scheme.official_portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#111111] bg-white border border-[#E5E5E5] hover:bg-[#F7F7F6] rounded-lg transition-colors"
          >
            <span>Official Portal Link</span>
            <GovIcon name="external-link" className="w-3.5 h-3.5 text-[#555555]" />
          </a>
        </div>
      </div>

      {/* Grid: Rules & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Rules & Details */}
        <div className="md:col-span-7 space-y-6">
          {/* Detailed Overview */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <GovIcon name="info" className="w-4 h-4 text-[#111111]" />
              Detailed Scheme Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
              {scheme.detailed_description}
            </p>
            <div className="pt-2 text-xs text-[#555555]">
              <strong className="text-[#111111]">Target Beneficiaries:</strong> {scheme.target_beneficiaries}
            </div>
          </div>

          {/* Deterministic Eligibility Rules */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <GovIcon name="shield-check" className="w-4 h-4 text-[#15803D]" />
                Eligibility Criteria ({scheme.eligibility_rules?.length || 0})
              </h2>
              <span className="text-xs text-[#858585] font-mono font-semibold">
                DETERMINISTIC
              </span>
            </div>

            <div className="space-y-3">
              {scheme.eligibility_rules?.map((rule: any) => {
                let desc = rule.description_en;
                if (language === 'kn' && rule.description_kn) desc = rule.description_kn;
                else if (language === 'hi' && rule.description_hi) desc = rule.description_hi;
                else if (language === 'ur' && rule.description_ur) desc = rule.description_ur;

                return (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#858585] font-semibold">{rule.rule_code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        rule.is_mandatory ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#E5E5E5] text-[#555555]'
                      }`}>
                        {rule.is_mandatory ? 'Mandatory Rule' : 'Optional Condition'}
                      </span>
                    </div>
                    <p className="font-semibold text-[#111111] leading-snug">{desc}</p>
                    <div className="font-mono text-[11px] text-[#555555] pt-1 border-t border-[#E5E5E5]">
                      Condition: <code>{rule.field_name}</code> ({rule.operator}) &rarr; Required: <code>{rule.target_value}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Steps */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <GovIcon name="document-check" className="w-4 h-4 text-[#111111]" />
              Official Portal Application Procedure
            </h2>
            <div className="text-xs text-[#555555] whitespace-pre-line leading-relaxed bg-[#F7F7F6] p-4 rounded-xl border border-[#E5E5E5]">
              {scheme.application_process}
            </div>
          </div>
        </div>

        {/* Right Column: Required Documents & Sources */}
        <div className="md:col-span-5 space-y-6">
          {/* Required Documents Checklist */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <GovIcon name="document" className="w-4 h-4 text-[#111111]" />
              Required Document Checklist
            </h2>
            <div className="space-y-3">
              {scheme.required_documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111]">{doc.document_name}</span>
                    {doc.is_mandatory && (
                      <span className="font-mono text-[10px] text-[#DC2626] font-bold uppercase">Required</span>
                    )}
                  </div>
                  {doc.document_name_kn && (
                    <p className="text-[11px] text-[#555555]">{doc.document_name_kn}</p>
                  )}
                  {doc.guidelines && (
                    <p className="text-[11px] text-[#858585] italic">{doc.guidelines}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Government Source Verification Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <GovIcon name="shield-check" className="w-4 h-4 text-[#15803D]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                Source Verification Record
              </h3>
            </div>
            <div className="space-y-2 text-[#555555]">
              <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                <span>Status:</span>
                <span className="font-bold text-[#15803D] uppercase">Verified & Published</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                <span>Audit Date:</span>
                <span className="font-semibold text-[#111111]">{scheme.last_verified_date}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-1.5">
                <span>Audited By:</span>
                <span className="text-[#111111]">{scheme.verified_by_admin || 'Government Review Team'}</span>
              </div>
              {scheme.sources && scheme.sources.length > 0 && (
                <div className="pt-1">
                  <span className="block font-semibold text-[#111111] mb-1">Official Repository URL:</span>
                  <a
                    href={scheme.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#111111] hover:underline font-mono text-[11px] break-all block"
                  >
                    {scheme.sources[0].url}
                  </a>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#858585] pt-2 border-t border-[#E5E5E5] leading-relaxed">
              Statutory verification and benefit disbursement are managed solely by the respective state or central government department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
