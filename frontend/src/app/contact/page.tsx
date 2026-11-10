'use client';

import React, { useState } from 'react';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Scheme Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="verified">Citizen Support Helpdesk</Badge>
          <span className="text-xs text-[#858585]">Karnataka & National Service</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
          Help & Citizen Desk
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
          Questions regarding scheme eligibility, document verification, or portal handoffs? Contact our public GovTech team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Contact Information Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-3 text-xs sm:text-sm">
            <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
              01 / Direct Contact
            </span>
            <h3 className="font-semibold text-[#111111] text-base">
              Public Support Email
            </h3>
            <p className="text-[#555555] text-xs">
              For technical queries, feedback, or scheme rule verifications:
            </p>
            <p className="font-mono font-medium text-xs text-[#111111] bg-[#F7F7F6] p-2.5 rounded-lg border border-[#E5E5E5]">
              support@jansetu.gov.in
            </p>
            <p className="text-[11px] text-[#858585]">Standard response: within 24 business hours</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-3 text-xs sm:text-sm">
            <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
              02 / Official Helplines
            </span>
            <h3 className="font-semibold text-[#111111] text-base">
              Karnataka State Helplines
            </h3>
            <div className="space-y-2 text-xs">
              <div className="border-b border-[#E5E5E5] pb-2">
                <span className="font-medium text-[#111111] block">SSP Scholarship Helpline:</span>
                <span className="text-[#111111] font-semibold">1902</span> &bull; <span className="text-[#555555]">080-22032000</span>
              </div>
              <div className="border-b border-[#E5E5E5] pb-2">
                <span className="font-medium text-[#111111] block">Seva Sindhu Citizen Portal:</span>
                <span className="text-[#111111] font-semibold">080-22230282</span>
              </div>
              <div className="border-b border-[#E5E5E5] pb-2">
                <span className="font-medium text-[#111111] block">Arogya Karnataka Health:</span>
                <span className="text-[#111111] font-semibold">104</span>
              </div>
              <div>
                <span className="font-medium text-[#111111] block">Food & Civil Supplies (Anna Bhagya):</span>
                <span className="text-[#111111] font-semibold">1967</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Message Form */}
        <div className="md:col-span-7 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#E5E5E5] pb-3">
            <span className="text-[10px] uppercase tracking-wider text-[#858585] font-semibold block">
              Inquiry Dispatch
            </span>
            <h2 className="text-base font-semibold text-[#111111]">
              Send a Message to Citizen Helpdesk
            </h2>
          </div>

          {submitted ? (
            <div className="p-6 bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg text-center space-y-2">
              <GovIcon name="check" className="w-8 h-8 text-[#15803D] mx-auto" />
              <h3 className="text-base font-semibold text-[#15803D]">Inquiry Dispatched Successfully</h3>
              <p className="text-xs text-[#15803D] leading-relaxed">
                Thank you, {name}. A Jan Setu support officer will review your inquiry and follow up at {email}.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                  Your Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. citizen@example.com"
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                  Inquiry Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="Scheme Inquiry">Scheme Eligibility Inquiry</option>
                  <option value="Document Scanning">Document Upload & Quality Check</option>
                  <option value="Portal Handoff">Government Portal Submission Assistance</option>
                  <option value="Report Scheme Outdated">Report Outdated Scheme Information</option>
                  <option value="Feedback">Platform Accessibility Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                  Describe Your Question or Situation
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what scheme or assistance you need in your own words..."
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="md">
                  Send Support Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
