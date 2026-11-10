'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GovIcon } from './ui/GovIcon';
import { GovBuildingIllustration } from './illustrations/GovBuildingIllustration';
import { FolderIllustration } from './illustrations/FolderIllustration';
import { RightAssistantPanel } from './RightAssistantPanel';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (user) {
          const apps = await api.listApplications();
          setApplications(apps);
        }
      } catch (err) {
        console.error('Error fetching applications for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="flex flex-col xl:flex-row items-start gap-6 w-full max-w-[1580px] mx-auto">
      {/* Central Main Dashboard Area */}
      <div className="flex-1 w-full space-y-6 min-w-0">
        {/* Main Hero Card */}
        <section className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text Column */}
          <div className="flex-1 max-w-xl z-10 space-y-2">
            <span className="font-bold text-xl sm:text-2xl text-[#111111] block leading-tight">
              Jan Setu AI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] leading-tight tracking-tight pt-1">
              Find Government Schemes, Get Help, Apply with Ease
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-md pt-2">
              Your smart assistant for all government schemes, eligibility and application support.
            </p>

            <div className="pt-4">
              <Link href="/schemes">
                <button
                  type="button"
                  className="bg-[#111111] text-white hover:bg-[#262626] font-medium text-xs sm:text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors active:scale-[0.99]"
                >
                  <span>Find Government Schemes</span>
                  <GovIcon name="arrow-right" className="w-4 h-4 text-white" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Government Building Illustration */}
          <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 flex items-center justify-center pt-2 md:pt-0">
            <GovBuildingIllustration className="w-full max-w-[360px] h-auto object-contain" />
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-[#111111]">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Find Schemes */}
            <Link
              href="/schemes"
              className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-5 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F6] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <GovIcon name="search" className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">
                    Find Schemes
                  </h4>
                  <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                    Search and explore available schemes
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <span className="w-6 h-6 rounded-full bg-[#F7F7F6] border border-[#E5E5E5] group-hover:border-[#111111] flex items-center justify-center text-[#111111] transition-colors">
                  <GovIcon name="arrow-right" className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 2: Ask AI Assistant */}
            <Link
              href="/assistant"
              className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-5 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F6] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <GovIcon name="chat" className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">
                    Ask AI Assistant
                  </h4>
                  <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                    Get answers in your language
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <span className="w-6 h-6 rounded-full bg-[#F7F7F6] border border-[#E5E5E5] group-hover:border-[#111111] flex items-center justify-center text-[#111111] transition-colors">
                  <GovIcon name="arrow-right" className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 3: Manage Documents */}
            <Link
              href="/documents"
              className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-5 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F6] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <GovIcon name="document" className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">
                    Manage Documents
                  </h4>
                  <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                    Upload and review your documents
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <span className="w-6 h-6 rounded-full bg-[#F7F7F6] border border-[#E5E5E5] group-hover:border-[#111111] flex items-center justify-center text-[#111111] transition-colors">
                  <GovIcon name="arrow-right" className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 4: Track Applications */}
            <Link
              href="/applications"
              className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-5 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F7F6] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <GovIcon name="briefcase" className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">
                    Track Applications
                  </h4>
                  <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                    Check your application status
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <span className="w-6 h-6 rounded-full bg-[#F7F7F6] border border-[#E5E5E5] group-hover:border-[#111111] flex items-center justify-center text-[#111111] transition-colors">
                  <GovIcon name="arrow-right" className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Continue Your Journey Section */}
        <section className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-[#111111]">
            Continue Your Journey
          </h3>

          {applications.length === 0 ? (
            /* Empty State Matching Screenshot */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F6] border border-[#E5E5E5] flex items-center justify-center text-[#111111] flex-shrink-0 mt-0.5">
                  <GovIcon name="document" className="w-6 h-6 text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#111111]">
                    No active applications yet
                  </h4>
                  <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                    Explore schemes and start your journey today.
                  </p>
                  <div className="pt-3">
                    <Link href="/schemes">
                      <button
                        type="button"
                        className="bg-[#111111] text-white hover:bg-[#262626] font-medium text-xs px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                      >
                        <span>Explore Schemes</span>
                        <GovIcon name="arrow-right" className="w-3.5 h-3.5 text-white" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Folder Vector Illustration */}
              <div className="w-28 h-24 flex items-center justify-center flex-shrink-0">
                <FolderIllustration className="w-24 h-20" />
              </div>
            </div>
          ) : (
            /* Real Applications from Database */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                  Active Prepared Applications ({applications.length})
                </span>
                <Link href="/applications" className="text-xs font-semibold text-[#111111] hover:underline">
                  View All Dossiers &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                        <h5 className="font-bold text-sm text-[#111111] truncate">{app.scheme_title}</h5>
                      </div>
                      <p className="text-xs text-[#555555] truncate">{app.department}</p>
                      {app.official_reference_number ? (
                        <p className="font-mono text-[11px] text-[#15803D]">
                          Ref: {app.official_reference_number}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#B45309]">
                          {app.missing_fields_count > 0 ? `${app.missing_fields_count} items pending` : 'Checklist ready'}
                        </p>
                      )}
                    </div>
                    <Link href={`/apply/${app.scheme_id}`} className="text-xs font-semibold text-[#111111] hover:underline flex-shrink-0">
                      Open &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Right-Side Dedicated Jan Setu AI Assistant Panel */}
      <div className="w-full xl:w-[454px] flex-shrink-0">
        <RightAssistantPanel />
      </div>
    </div>
  );
};

