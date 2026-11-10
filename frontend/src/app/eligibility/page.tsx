'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

function EligibilityContent() {
  const searchParams = useSearchParams();
  const preselectedScheme = searchParams.get('scheme') || '';
  const { user } = useAuth();
  const { language } = useLanguage();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(preselectedScheme);
  const [currentScheme, setCurrentScheme] = useState<any>(null);

  const [formValues, setFormValues] = useState<Record<string, any>>({
    domicile_state: 'Karnataka',
    annual_income: 150000,
    is_student: true,
    gender: 'Female',
    occupation: 'Student',
    education_level: 'Undergraduate',
    ration_card_type: 'BPL',
    land_holding_acres: 0.0,
    age: 22
  });

  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const list = await api.listSchemes();
        setSchemes(list);
        if (preselectedScheme && list.some(s => s.id === preselectedScheme || s.code === preselectedScheme)) {
          setSelectedSchemeId(preselectedScheme);
        } else if (list.length > 0 && !selectedSchemeId) {
          setSelectedSchemeId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching schemes:', err);
      }
    }
    loadSchemes();
  }, [preselectedScheme]);

  useEffect(() => {
    async function loadSchemeDetail() {
      if (!selectedSchemeId) return;
      try {
        const detail = await api.getSchemeDetail(selectedSchemeId);
        setCurrentScheme(detail);
      } catch (err) {
        console.error('Error loading detail:', err);
      }
    }
    loadSchemeDetail();
  }, [selectedSchemeId]);

  useEffect(() => {
    if (user && user.profile) {
      setFormValues(prev => ({
        ...prev,
        domicile_state: user.profile.domicile_state || 'Karnataka',
        annual_income: user.profile.annual_income || 150000,
        is_student: user.profile.is_student ?? true,
        gender: user.profile.gender || 'Female',
        occupation: user.profile.occupation || 'Student',
        education_level: user.profile.education_level || 'Undergraduate',
        ration_card_type: user.profile.ration_card_type || 'BPL',
        land_holding_acres: user.profile.land_holding_acres || 0.0,
        age: user.profile.age || 22
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, val: any) => {
    setFormValues(prev => ({ ...prev, [field]: val }));
  };

  const runEvaluation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSchemeId) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluateEligibility({
        scheme_id: selectedSchemeId,
        custom_answers: formValues,
        language
      });
      setEvaluationResult(res.evaluation);
    } catch (err) {
      console.error('Error evaluating:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-[#858585] font-mono">
          <span className="text-[#111111] font-semibold uppercase tracking-wider">Deterministic Audit Engine</span>
          <span>/</span>
          <span>Statutory Condition Evaluation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          Eligibility Assessment
        </h1>
        <p className="text-sm text-[#555555] max-w-2xl leading-relaxed">
          Verify your eligibility against published government rules line by line. Every condition is evaluated strictly using deterministic logic without speculation.
        </p>
      </div>

      {/* Main Grid: Parameters on Left, Assessment on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-5 self-start">
          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-2">
              Select Scheme to Audit
            </label>
            <select
              value={selectedSchemeId}
              onChange={(e) => {
                setSelectedSchemeId(e.target.value);
                setEvaluationResult(null);
              }}
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium focus:outline-none focus:border-[#111111]"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {currentScheme && (
            <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#111111] block">{currentScheme.department}</span>
              <p className="text-[#555555] line-clamp-2">{currentScheme.short_description}</p>
            </div>
          )}

          <div className="border-t border-[#E5E5E5] pt-4 space-y-4 text-xs">
            <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Citizen Profile Parameters
            </h3>

            {/* Domicile State */}
            <div>
              <label className="block font-medium text-[#111111] mb-1">State of Domicile</label>
              <select
                value={formValues.domicile_state}
                onChange={(e) => handleInputChange('domicile_state', e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111]"
              >
                <option value="Karnataka">Karnataka (Permanent Domicile)</option>
                <option value="Other">Other Indian State</option>
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <label className="block font-medium text-[#111111] mb-1">
                Annual Family Income: ₹{Number(formValues.annual_income || 0).toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min="0"
                max="600000"
                step="10000"
                value={formValues.annual_income}
                onChange={(e) => handleInputChange('annual_income', parseFloat(e.target.value))}
                className="w-full accent-[#111111]"
              />
              <div className="flex justify-between text-[11px] text-[#858585] mt-1">
                <span>₹0</span>
                <span>₹2.5 Lakh</span>
                <span>₹6.0 Lakh</span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium text-[#111111] mb-1">Gender</label>
              <select
                value={formValues.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111]"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>

            {/* Student Status */}
            <div className="flex items-center justify-between p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg">
              <span className="font-medium text-[#111111]">Currently Enrolled Student?</span>
              <input
                type="checkbox"
                checked={formValues.is_student}
                onChange={(e) => handleInputChange('is_student', e.target.checked)}
                className="w-4 h-4 accent-[#111111]"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block font-medium text-[#111111] mb-1">Occupation</label>
              <select
                value={formValues.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111]"
              >
                <option value="Student">Student</option>
                <option value="Farmer">Farmer / Cultivator</option>
                <option value="Unemployed">Unemployed Degree / Diploma Holder</option>
                <option value="Artisan">Traditional Artisan / Craftsperson</option>
                <option value="Daily Wage">Daily Wage Worker</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Ration Card */}
            <div>
              <label className="block font-medium text-[#111111] mb-1">Family Ration Card Type</label>
              <select
                value={formValues.ration_card_type}
                onChange={(e) => handleInputChange('ration_card_type', e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111]"
              >
                <option value="BPL">BPL (Priority Household)</option>
                <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                <option value="APL">APL (Non-Priority Household)</option>
                <option value="None">No Ration Card</option>
              </select>
            </div>

            {formValues.occupation === 'Farmer' && (
              <div>
                <label className="block font-medium text-[#111111] mb-1">Land Holding (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formValues.land_holding_acres}
                  onChange={(e) => handleInputChange('land_holding_acres', parseFloat(e.target.value))}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111]"
                />
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full text-xs font-semibold tracking-wide"
            onClick={() => runEvaluation()}
            isLoading={isEvaluating}
          >
            Audit Criteria Now
          </Button>
        </div>

        {/* Right Area: Evaluation Results */}
        <div className="lg:col-span-7 space-y-6">
          {!evaluationResult ? (
            <div className="bg-[#FFFFFF] border border-dashed border-[#E5E5E5] rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F6] text-[#111111] mx-auto flex items-center justify-center border border-[#E5E5E5]">
                <GovIcon name="shield-check" className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#111111]">Awaiting Parameter Input</h3>
                <p className="text-xs text-[#555555] max-w-sm mx-auto leading-relaxed">
                  Adjust citizen attributes on the left and click "Audit Criteria Now" to inspect the itemized statutory evaluation.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => runEvaluation()} isLoading={isEvaluating}>
                Run Assessment Now &rarr;
              </Button>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-6">
              {/* Overall Status Banner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <span className="text-xs font-semibold text-[#858585] uppercase tracking-wider">
                    Determination Verdict
                  </span>
                  {evaluationResult.status === 'likely_eligible' && (
                    <Badge variant="verified">Likely Eligible</Badge>
                  )}
                  {evaluationResult.status === 'not_eligible' && (
                    <Badge variant="error">Not Eligible Based on Information</Badge>
                  )}
                  {evaluationResult.status === 'more_information_required' && (
                    <Badge variant="pending">More Information Required</Badge>
                  )}
                </div>

                <div className={`p-4 rounded-lg border text-xs sm:text-sm leading-relaxed ${
                  evaluationResult.status === 'likely_eligible'
                    ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                    : evaluationResult.status === 'not_eligible'
                    ? 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]'
                    : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
                }`}>
                  <p className="font-semibold text-sm mb-1">Audit Summary:</p>
                  <p className="leading-relaxed">{evaluationResult.summary}</p>
                </div>
              </div>

              {/* Conditions Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
                    <GovIcon name="check" className="w-4 h-4 text-[#111111]" />
                    <span>Statutory Condition Breakdown</span>
                  </h3>
                  <span className="text-xs font-medium text-[#858585]">
                    {evaluationResult.satisfied_count} of {evaluationResult.total_conditions} Satisfied
                  </span>
                </div>

                <div className="space-y-3">
                  {evaluationResult.breakdown?.map((cond: any, idx: number) => {
                    const isSat = cond.status === 'satisfied';
                    const isMiss = cond.status === 'missing_information';

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-[#E5E5E5] bg-[#F7F7F6] text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#111111]">{cond.description}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            isSat
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : isMiss
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}>
                            {isSat ? 'Satisfied' : isMiss ? 'Missing' : 'Failed'}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#555555]">{cond.reason}</p>

                        <div className="text-[11px] text-[#858585] flex items-center gap-3 pt-1 border-t border-[#E5E5E5]">
                          <span>Your Value: <strong className="text-[#111111]">{String(cond.provided_value ?? 'None')}</strong></span>
                          <span>&bull;</span>
                          <span>Required Threshold: <strong className="text-[#111111]">{cond.required_value}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Hand-off */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-4">
                <div className="text-[11px] text-[#858585] bg-[#F7F7F6] p-3 rounded-lg leading-relaxed border border-[#E5E5E5]">
                  {evaluationResult.disclaimer}
                </div>

                {evaluationResult.status === 'likely_eligible' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F7F6] p-4 rounded-lg border border-[#E5E5E5]">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Ready to prepare your application?</p>
                      <p className="text-xs text-[#555555]">Map your documents and generate your submission checklist.</p>
                    </div>
                    <Link href={`/apply/${selectedSchemeId}`}>
                      <Button variant="primary" size="sm">
                        Start Application Prep &rarr;
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EligibilityPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-[#858585]">
        Loading eligibility assessment...
      </div>
    }>
      <EligibilityContent />
    </Suspense>
  );
}
