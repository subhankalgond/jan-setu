'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { GovIcon } from '../../../components/ui/GovIcon';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function PrepareApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params.schemeId as string;
  const { user } = useAuth();

  const [scheme, setScheme] = useState<any>(null);
  const [prepResult, setPrepResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableValues, setEditableValues] = useState<Record<string, any>>({});
  const [isApprovedByCitizen, setIsApprovedByCitizen] = useState(false);
  const [referenceInput, setReferenceInput] = useState('');
  const [isRefSaved, setIsRefSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [schemeData, prepData] = await Promise.all([
          api.getSchemeDetail(schemeId),
          api.prepareApplication({ scheme_id: schemeId })
        ]);
        setScheme(schemeData);
        setPrepResult(prepData);
        setEditableValues(prepData.prepared_fields || {});
      } catch (err) {
        console.error('Error preparing application:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [schemeId]);

  const handleFieldChange = (field: string, val: any) => {
    setEditableValues(prev => ({ ...prev, [field]: val }));
  };

  const handleSavePreparation = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.prepareApplication({
        scheme_id: schemeId,
        custom_field_values: editableValues,
        notes: 'Prepared and verified by citizen'
      });
      setPrepResult(res);
      setIsApprovedByCitizen(true);
    } catch (err: any) {
      alert(err.message || 'Error updating preparation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceInput.trim() || !prepResult?.application_id) return;

    try {
      await api.recordReference(prepResult.application_id, {
        reference_number: referenceInput.trim(),
        submission_date: new Date().toISOString().split('T')[0],
        status_notes: 'Reference recorded after submission on official government portal'
      });
      setIsRefSaved(true);
    } catch (err: any) {
      alert(err.message || 'Error recording reference number.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-3 text-xs">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#555555]">Assembling checklist and mapping parameters...</p>
      </div>
    );
  }

  if (!scheme || !prepResult) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3 text-xs">
        <GovIcon name="alert-triangle" className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h3 className="text-base font-bold text-[#111111]">Unable to Prepare Application</h3>
        <p className="text-[#555555]">Please sign in with your citizen account or select a valid scheme record.</p>
        <div className="pt-2">
          <Link href="/schemes">
            <Button variant="outline" size="sm">Back to Schemes Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const missingFields = prepResult.missing_fields || [];
  const hasMissing = missingFields.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#555555]">
        <Link href="/schemes" className="hover:text-[#111111]">
          Directory
        </Link>
        <span>/</span>
        <Link href={`/schemes/${scheme.id}`} className="hover:text-[#111111] truncate max-w-xs">
          {scheme.code}
        </Link>
        <span>/</span>
        <span className="text-[#111111] font-medium">Application Preparation</span>
      </div>

      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
          <Badge variant="verified">Application Preparation</Badge>
          <span className="font-mono text-xs text-[#858585]">Code: {scheme.code}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            Prepare Application: {scheme.title}
          </h1>
          <p className="text-xs text-[#555555]">
            Responsible Department: <strong className="text-[#111111]">{scheme.department}</strong>
          </p>
        </div>
      </div>

      {/* Transparency Charter Notice */}
      <div className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl text-xs text-[#111111] flex items-start gap-3">
        <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#111111]">
          <GovIcon name="shield-check" className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-[#111111]">
            GovTech Transparency Notice:
          </p>
          <p className="text-[#555555] leading-relaxed">
            Jan Setu organizes your verified documents and pre-populates required parameters into a compliant checklist. We never submit directly to departmental servers without your authorization. You will proceed to the official department portal and log your submission reference here for continuous tracking.
          </p>
        </div>
      </div>

      {/* Missing Items Warning if any */}
      {hasMissing && (
        <div className="p-5 bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#B45309] font-bold">
            <GovIcon name="alert-triangle" className="w-4 h-4" />
            <span>Mandatory Items Pending ({missingFields.length}):</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#92400E] pl-6 list-disc">
            {missingFields.map((m: any, idx: number) => (
              <li key={idx}>
                {m.label} &mdash; <span className="text-[#858585]">{m.type === 'document' ? 'Certificate upload required' : 'Profile field empty'}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-[#FEF3C7]">
            <Link href="/documents">
              <Button variant="outline" size="sm">
                Open Document Center to Upload &rarr;
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Field Mapping Review Section */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#111111]">
              Mapped Form Parameters (From Approved Profile & Documents)
            </h2>
            <p className="text-xs text-[#555555]">Verify accuracy before portal submission</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Applicant Legal Name
            </label>
            <input
              type="text"
              value={editableValues.full_name || ''}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={editableValues.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              State of Domicile
            </label>
            <input
              type="text"
              value={editableValues.domicile_state || 'Karnataka'}
              onChange={(e) => handleFieldChange('domicile_state', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Nadakacheri Certificate / RD Number
            </label>
            <input
              type="text"
              value={editableValues.certificate_number || ''}
              onChange={(e) => handleFieldChange('certificate_number', e.target.value)}
              placeholder="e.g. RD00384729104"
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm font-mono text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Annual Family Income (₹)
            </label>
            <input
              type="number"
              value={editableValues.annual_income || ''}
              onChange={(e) => handleFieldChange('annual_income', parseFloat(e.target.value))}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Caste / Social Category
            </label>
            <input
              type="text"
              value={editableValues.caste_category || ''}
              onChange={(e) => handleFieldChange('caste_category', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Ration Card Type
            </label>
            <input
              type="text"
              value={editableValues.ration_card_type || ''}
              onChange={(e) => handleFieldChange('ration_card_type', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Residence District
            </label>
            <input
              type="text"
              value={editableValues.residence_district || ''}
              onChange={(e) => handleFieldChange('residence_district', e.target.value)}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#555555]">
            Review all values before final preparation approval
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={handleSavePreparation}
            isLoading={isSubmitting}
          >
            <GovIcon name="check" className="w-4 h-4 mr-2" />
            Approve & Save Preparation
          </Button>
        </div>
      </div>

      {/* Official Portal Handoff & Reference Logger */}
      {isApprovedByCitizen && (
        <div className="bg-[#FFFFFF] border border-[#111111] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-[#111111] border-b border-[#E5E5E5] pb-3">
            <GovIcon name="shield-check" className="w-5 h-5 text-[#15803D]" />
            <h3 className="text-lg font-bold text-[#111111]">
              Checklist Approved &bull; Ready for Official Submission
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
            Your structured checklist is verified. Now navigate to the authenticated departmental portal below to submit your official application.
          </p>

          <div className="p-4 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#555555] block">
                Official Government Portal:
              </span>
              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs sm:text-sm text-[#111111] font-bold hover:underline break-all"
              >
                {scheme.official_portal_url}
              </a>
            </div>
            <a
              href={scheme.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="md">
                <span>Continue to Official Portal</span>
                <GovIcon name="external-link" className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Reference Number Logger */}
          <div className="border-t border-[#E5E5E5] pt-5 space-y-3">
            <h4 className="text-sm font-bold text-[#111111]">
              Record Official Application Acknowledgment Number:
            </h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Upon final submission on the departmental portal, paste your official reference or acknowledgment number here to store it securely in your Jan Setu application register.
            </p>

            {isRefSaved ? (
              <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-xs font-mono text-[#166534] flex items-center gap-2 font-medium">
                <GovIcon name="check" className="w-4 h-4 text-[#15803D]" />
                <span>Reference number recorded. View anytime in My Applications register.</span>
              </div>
            ) : (
              <form onSubmit={handleRecordReference} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  placeholder="e.g. SSP/2026/KA/883921 or GL/BEL/2026/092"
                  className="flex-1 bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm font-mono text-[#111111] focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!referenceInput.trim()}>
                  Save Reference Number
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
