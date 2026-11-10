'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('prepared');
  const [statusNotes, setStatusNotes] = useState('');

  // Reference modal
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refNumberInput, setRefNumberInput] = useState('');
  const [refDateInput, setRefDateInput] = useState(new Date().toISOString().split('T')[0]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await api.listApplications();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    try {
      await api.updateApplicationStatus(selectedApp.id, {
        status: newStatus,
        notes: statusNotes
      });
      setIsStatusModalOpen(false);
      setSelectedApp(null);
      await loadApplications();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleSaveReference = async () => {
    if (!selectedApp || !refNumberInput.trim()) return;
    try {
      await api.recordReference(selectedApp.id, {
        reference_number: refNumberInput.trim(),
        submission_date: refDateInput,
        status_notes: 'Reference number saved by citizen'
      });
      setIsRefModalOpen(false);
      setSelectedApp(null);
      setRefNumberInput('');
      await loadApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to save reference number.');
    }
  };

  const statusBadges: Record<string, { label: string; variant: 'verified' | 'pending' | 'error' | 'neutral' }> = {
    draft: { label: 'Draft Intake', variant: 'neutral' },
    documents_pending: { label: 'Documents Pending', variant: 'pending' },
    ready_for_review: { label: 'Ready for Review', variant: 'pending' },
    prepared: { label: 'Checklist Prepared', variant: 'verified' },
    redirected_to_official_portal: { label: 'Redirected to Portal', variant: 'neutral' },
    reference_recorded: { label: 'Reference Recorded', variant: 'verified' },
    completed_by_citizen: { label: 'Completed by Citizen', variant: 'verified' }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#555555]">
            <span className="font-semibold text-[#111111] uppercase tracking-wider">Citizen Register</span>
            <span>&bull;</span>
            <span>Application Tracking</span>
          </div>
          <span className="text-xs text-[#858585]">
            Total Records: <strong className="text-[#111111]">{applications.length}</strong>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          My Prepared Applications
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] max-w-3xl leading-relaxed">
          Maintain your personal statutory application register. Audit pre-filled parameters, review mapped certificates, and securely log official department acknowledgment reference numbers.
        </p>
      </div>

      {/* GovTech Integrity Notice Banner */}
      <div className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl text-xs text-[#111111] flex items-start gap-3">
        <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#111111]">
          <GovIcon name="shield-check" className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-[#111111]">
            Statutory Integrity Policy:
          </p>
          <p className="text-[#555555] leading-relaxed">
            Jan Setu assists in eligibility verification, document normalization, and checklist preparation. We never fabricate live government processing statuses. Departmental processing is solely executed by authorized state and central portals.
          </p>
        </div>
      </div>

      {/* List / Ledger */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3 text-xs">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#555555]">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl flex items-center justify-center mx-auto text-[#858585]">
            <GovIcon name="briefcase" className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#111111]">No Applications Prepared Yet</h3>
            <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
              Explore verified government schemes, evaluate eligibility criteria, and click "Prepare Application" to create your first organized checklist.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/schemes">
              <Button variant="primary" size="md">
                <GovIcon name="search" className="w-4 h-4 mr-2" />
                Discover Government Schemes
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const badgeInfo = statusBadges[app.status] || { label: app.status, variant: 'neutral' as const };

            return (
              <div
                key={app.id}
                className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badgeInfo.variant}>
                      {badgeInfo.label}
                    </Badge>
                    <span className="font-mono text-xs text-[#858585] bg-[#F7F7F6] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {app.scheme_code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#111111]">
                      {app.scheme_title}
                    </h3>
                    <p className="text-xs text-[#555555] mt-0.5">{app.department}</p>
                  </div>

                  {/* Reference Number Display */}
                  {app.official_reference_number ? (
                    <div className="p-2.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-xs text-[#166534] flex items-center gap-2">
                      <GovIcon name="check" className="w-4 h-4 text-[#15803D] flex-shrink-0" />
                      <span>Official Reference Number: <strong className="text-[#111111] font-mono">{app.official_reference_number}</strong></span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#B45309]">
                      {app.missing_fields_count > 0
                        ? `${app.missing_fields_count} mandatory items missing from checklist`
                        : 'Checklist prepared. Ready for submission on official portal.'}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#858585] pt-1">
                    <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto items-stretch">
                  <Link href={`/apply/${app.scheme_id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Open Checklist
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app);
                      setRefNumberInput(app.official_reference_number || '');
                      setIsRefModalOpen(true);
                    }}
                  >
                    {app.official_reference_number ? 'Edit Reference No.' : 'Record Reference No.'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app);
                      setNewStatus(app.status);
                      setStatusNotes('');
                      setIsStatusModalOpen(true);
                    }}
                  >
                    Update Stage
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Reference Modal */}
      {isRefModalOpen && selectedApp && (
        <Modal
          isOpen={isRefModalOpen}
          onClose={() => setIsRefModalOpen(false)}
          title={`Record Official Reference: ${selectedApp.scheme_title}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#555555] leading-relaxed">
              Enter the official acknowledgment or application tracking number provided by the government department portal upon final submission:
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Official Reference Number:
              </label>
              <input
                type="text"
                value={refNumberInput}
                onChange={(e) => setRefNumberInput(e.target.value)}
                placeholder="e.g. SSP-2026-KA-9921 or GL/MYS/2026/1029"
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-sm font-mono text-[#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Submission Date:
              </label>
              <input
                type="date"
                value={refDateInput}
                onChange={(e) => setRefDateInput(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-xs text-[#111111] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button variant="outline" size="sm" onClick={() => setIsRefModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveReference} disabled={!refNumberInput.trim()}>
                Save Reference Number
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedApp && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Status: ${selectedApp.scheme_title}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Select Preparation Stage:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] focus:outline-none"
              >
                <option value="draft">Draft (Initial Preparation)</option>
                <option value="documents_pending">Documents Pending Upload</option>
                <option value="ready_for_review">Ready for Review</option>
                <option value="prepared">Prepared & Verified</option>
                <option value="redirected_to_official_portal">Redirected to Government Portal</option>
                <option value="reference_recorded">Reference Number Recorded</option>
                <option value="completed_by_citizen">Completed by Citizen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Notes / Reminder:
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Uploaded caste certificate, waiting for college verification"
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateStatus}>
                Update Stage
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
