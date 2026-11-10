'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GovIcon } from './ui/GovIcon';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const WorkflowPreview: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const sampleQueries = [
    {
      role: 'Student',
      codeTag: 'KA-EDU-SSP',
      text: 'I am a 3rd year engineering student in Dharwad. Are there scholarships for college fee reimbursement?',
      scheme: 'SSP Post-Matric Scholarship',
      code: 'KA-SSP-01',
      dept: 'Social Welfare & Backward Classes Dept, Karnataka',
      portal: 'https://ssp.postmatric.karnataka.gov.in/',
      benefit: '100% course tuition fee reimbursement + monthly maintenance allowance',
      verifiedRules: [
        { name: 'Karnataka Domicile', status: 'satisfied', note: 'Study certificate verified: Dharwad' },
        { name: 'Accredited Degree Enrolled', status: 'satisfied', note: 'B.E. 3rd year regular student' },
        { name: 'Family Income <= ₹2.5 Lakh', status: 'satisfied', note: 'Nadakacheri RD verified: ₹1.2L' }
      ],
      requiredDocs: ['Nadakacheri Caste & Income Certificate', 'College Fee Receipt', 'SSLC Marks Card', 'Aadhaar Seeded Bank Account']
    },
    {
      role: 'Woman Head',
      codeTag: 'KA-WCD-GL',
      text: 'ನಾನು ಬೆಳಗಾವಿಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೇನೆ. ಕುಟುಂಬದ ಯಜಮಾನಿಯಾಗಿ ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?',
      scheme: 'Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ)',
      code: 'KA-GL-02',
      dept: 'Women & Child Development Dept, Karnataka',
      portal: 'https://sevasindhuservices.karnataka.gov.in/',
      benefit: '₹2,000 monthly direct bank transfer (DBT) to the designated woman head',
      verifiedRules: [
        { name: 'Woman Head of Household', status: 'satisfied', note: 'Designated head on Ration Card' },
        { name: 'Permanent Karnataka Resident', status: 'satisfied', note: 'Belagavi district registered' },
        { name: 'Valid BPL/AAY/APL Card', status: 'satisfied', note: 'AAY card verified & active' }
      ],
      requiredDocs: ['Family Ration Card', 'Aadhaar Card of Woman Head', 'Aadhaar Linked Bank Passbook']
    },
    {
      role: 'Farmer',
      codeTag: 'KA-AGRI-RS',
      text: 'I have 2.5 acres of agricultural land in Mysuru. What government subsidies are available for millet farming?',
      scheme: 'Raitha Siri Scheme (ರೈತ ಸಿರಿ)',
      code: 'KA-RS-04',
      dept: 'Department of Agriculture, Karnataka',
      portal: 'https://fruits.karnataka.gov.in/',
      benefit: '₹10,000 per hectare for minor millet cultivation credited via FRUITS DBT',
      verifiedRules: [
        { name: 'Active Cultivator/Farmer', status: 'satisfied', note: 'Registered on FRUITS portal' },
        { name: 'Cultivable Land Record', status: 'satisfied', note: 'Pahani/RTC survey: 2.5 acres' },
        { name: 'Karnataka Land Location', status: 'satisfied', note: 'Mysuru district verified' }
      ],
      requiredDocs: ['Current Year Land RTC/Pahani', 'FRUITS Farmer ID (FID)', 'Aadhaar Bank Account']
    }
  ];

  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const currentCase = sampleQueries[selectedCaseIndex];

  return (
    <div className="bg-[#FAF6F0] border-2 border-[#0F1E36] rounded shadow-sm overflow-hidden text-xs">
      {/* Editorial Docket Header */}
      <div className="bg-[#0F1E36] text-[#FAF6F0] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#0F1E36]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
          <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
            CASE DOCKET // {currentCase.codeTag}
          </span>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="text-[#94A3B8] uppercase">Persona:</span>
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCaseIndex(idx)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                selectedCaseIndex === idx
                  ? 'bg-[#14B8A6] text-[#0F1E36]'
                  : 'bg-[#162B4D] text-[#CBD5E1] hover:bg-[#1E3A66]'
              }`}
            >
              {item.role}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Chapter Tabs */}
      <div className="grid grid-cols-4 border-b border-[#D5CEBF] bg-[#F3EFE6] text-center font-mono text-[11px]">
        {[
          { step: 1, label: '01 / INTAKE' },
          { step: 2, label: '02 / SCHEME' },
          { step: 3, label: '03 / AUDIT' },
          { step: 4, label: '04 / DISPATCH' }
        ].map(s => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`py-2 px-1 transition-all border-b-2 font-bold tracking-wider uppercase ${
              activeStep === s.step
                ? 'border-[#0D9488] text-[#0D9488] bg-[#FDFBF7]'
                : 'border-transparent text-[#64748B] hover:text-[#0F1E36] hover:bg-[#EAE4D8]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Docket Content Area */}
      <div className="p-5 min-h-[290px] flex flex-col justify-between bg-[#FDFBF7]">
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FAF6F0] rounded border border-[#E2DCCE] space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B] uppercase">
                <span>Citizen Statement</span>
                <span>Language: Auto-Detected</span>
              </div>
              <p className="font-serif text-sm sm:text-base text-[#0F1E36] font-medium italic leading-snug">
                "{currentCase.text}"
              </p>
            </div>

            <div className="p-3.5 bg-[#F0FDFA] rounded border border-[#CCFBF1] space-y-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#0F766E] uppercase">
                <GovIcon name="shield-check" className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Cognitive Extraction Result</span>
              </div>
              <p className="text-[#0F1E36] leading-relaxed">
                Intent mapped: <strong className="font-mono text-[#0F766E]">{currentCase.role} Support</strong>. Querying official Karnataka repository for verified guidelines.
              </p>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="verified">Verified Official Scheme</Badge>
              <span className="font-mono text-[10px] text-[#64748B]">Code: {currentCase.code}</span>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#0F1E36] leading-snug">
                {currentCase.scheme}
              </h4>
              <p className="text-[11px] text-[#64748B] font-mono mt-0.5">{currentCase.dept}</p>
            </div>

            <div className="p-3 bg-[#FAF6F0] border border-[#E2DCCE] rounded space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-[#0F766E] block">
                Statutory Benefits:
              </span>
              <p className="text-[#0F1E36] leading-relaxed font-medium">
                {currentCase.benefit}
              </p>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase text-[#0F1E36]">
                Deterministic Rule Audit
              </span>
              <Badge variant="verified">3 of 3 Conditions Passed</Badge>
            </div>

            <div className="space-y-2">
              {currentCase.verifiedRules.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#FAF6F0] border border-[#E2DCCE]">
                  <div className="flex items-center gap-2">
                    <GovIcon name="check" className="w-3.5 h-3.5 text-[#15803D]" />
                    <span className="font-semibold text-[#0F1E36]">{rule.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B]">{rule.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-3">
            <div className="p-3 bg-[#FAF6F0] border border-[#E2DCCE] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase text-[#0F1E36]">
                  Dossier Handoff Ready
                </span>
                <span className="font-mono text-[10px] text-[#15803D] font-bold">100% Prepared</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                All mandatory information prepared. Proceed directly to the official government portal:
              </p>
              <div className="pt-1">
                <a
                  href={currentCase.portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1"
                >
                  <span>{currentCase.portal}</span>
                  <GovIcon name="external-link" className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-2 bg-[#F3EFE6] border border-[#E2DCCE] rounded font-mono text-[10px] text-[#64748B]">
              <strong>GovTech Transparency:</strong> Applications are submitted directly on the authorized government portal. We do not automate submissions without statutory credentials.
            </div>
          </div>
        )}

        {/* Editorial Stepper Controls */}
        <div className="pt-3 border-t border-[#E2DCCE] flex items-center justify-between mt-3 font-mono text-[11px]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="text-[10px] uppercase font-bold"
          >
            &larr; Previous
          </Button>

          <span className="text-[#64748B] uppercase font-bold">
            Stage 0{activeStep} / 04
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
            disabled={activeStep === 4}
            className="text-[10px] uppercase font-bold"
          >
            Next Stage &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
