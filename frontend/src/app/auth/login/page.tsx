'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { GovIcon } from '../../../components/ui/GovIcon';
import { Button } from '../../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (role: 'citizen' | 'admin') => {
    if (role === 'citizen') {
      setEmail('citizen@jansetu.in');
      setPassword('CitizenPass@2026');
    } else {
      setEmail('admin@jansetu.gov.in');
      setPassword('JanSetuAdmin@2026');
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
            Citizen Identity Gateway
          </span>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Sign In to Jan Setu AI
          </h1>
        </div>
        <p className="text-xs text-[#555555] leading-relaxed max-w-xs mx-auto">
          Access your personal application dossiers, verified certificates ledger, and eligibility evaluations.
        </p>
      </div>

      {/* Main Login Docket */}
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
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@jansetu.in"
              className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
            >
            </input>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#858585] hover:text-[#111111]"
              >
                <GovIcon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full font-semibold" isLoading={isLoading}>
            Sign In to Account
          </Button>
        </form>

        {/* Demo Fast-Fill Chips */}
        <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
          <p className="text-[10px] font-semibold text-[#858585] uppercase tracking-wider">
            Quick Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickCredentials('citizen')}
              className="p-2.5 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg text-left hover:border-[#111111] transition-colors"
            >
              <div className="font-semibold text-[#111111]">Karnataka Citizen</div>
              <div className="text-[10px] text-[#858585]">citizen@jansetu.in</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className="p-2.5 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg text-left hover:border-[#111111] transition-colors"
            >
              <div className="font-semibold text-[#111111]">Platform Admin</div>
              <div className="text-[10px] text-[#858585]">admin@jansetu.gov.in</div>
            </button>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] pt-4 text-center">
          <p className="text-xs text-[#555555]">
            Do not have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-[#111111] hover:underline">
              Create an Account &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
