'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { GovIcon } from '../../../components/ui/GovIcon';
import { Button } from '../../../components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Karnataka');
  const [language, setLanguage] = useState('en');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMsg('Please confirm data-use consent before creating an account.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        state,
        preferred_language: language,
        password
      });
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#111111] text-[#FFFFFF] flex items-center justify-center mx-auto border border-[#111111]">
          <GovIcon name="national-emblem" className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858585] block">
            Citizen Enrollment
          </span>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Create Citizen Account
          </h1>
        </div>
        <p className="text-xs text-[#555555] leading-relaxed max-w-xs mx-auto">
          Minimum necessary information policy. No Aadhaar number required.
        </p>
      </div>

      {/* Main Register Docket */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs text-[#DC2626] flex items-center gap-2">
            <GovIcon name="alert-triangle" className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Pooja Ramesh Patil"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Kerala">Kerala</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
              Mobile Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
              Password (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="consent-check"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#111111]"
            />
            <label htmlFor="consent-check" className="text-[11px] text-[#555555] leading-relaxed">
              I agree to the <Link href="/terms" className="text-[#111111] font-semibold underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-[#111111] font-semibold underline">Privacy Policy</Link>. I understand Jan Setu AI assists in scheme discovery and application preparation.
            </label>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full font-semibold" isLoading={isLoading}>
            Create Citizen Account
          </Button>
        </form>
      </div>

      <div className="text-center text-xs text-[#555555]">
        Already registered?{' '}
        <Link href="/auth/login" className="font-semibold text-[#111111] hover:underline">
          Sign In to Account &rarr;
        </Link>
      </div>
    </div>
  );
}
