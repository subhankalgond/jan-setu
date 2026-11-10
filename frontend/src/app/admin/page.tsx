'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'schemes' | 'users' | 'audit'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState('published');
  const [statusNotes, setStatusNotes] = useState('');

  // Create scheme modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSchemeData, setNewSchemeData] = useState({
    code: '',
    title: '',
    kannada_title: '',
    department: '',
    government_level: 'karnataka',
    category: 'Education & Scholarships',
    target_beneficiaries: '',
    benefits_summary: '',
    short_description: '',
    detailed_description: '',
    application_process: '',
    official_portal_url: '',
    verification_status: 'draft',
    source_title: 'Official Department Notification',
    source_url: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ov, sch, us, aud] = await Promise.all([
        api.getAdminOverview(),
        api.listAdminSchemes(),
        api.listAdminUsers(),
        api.getAdminAuditLogs()
      ]);
      setOverview(ov);
      setSchemes(sch);
      setUsersList(us);
      setAuditLogs(aud);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleUpdateSchemeWorkflow = async () => {
    if (!selectedScheme) return;
    try {
      await api.updateSchemeStatus(selectedScheme.id, {
        status: workflowStatus,
        notes: statusNotes
      });
      setIsStatusModalOpen(false);
      setSelectedScheme(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminScheme({
        code: newSchemeData.code,
        title: newSchemeData.title,
        kannada_title: newSchemeData.kannada_title,
        short_description: newSchemeData.short_description,
        detailed_description: newSchemeData.detailed_description,
        department: newSchemeData.department,
        government_level: newSchemeData.government_level,
        state: 'Karnataka',
        category: newSchemeData.category,
        target_beneficiaries: newSchemeData.target_beneficiaries,
        benefits_summary: newSchemeData.benefits_summary,
        application_process: newSchemeData.application_process,
        official_portal_url: newSchemeData.official_portal_url,
        verification_status: newSchemeData.verification_status,
        sources: [
          {
            title: newSchemeData.source_title,
            url: newSchemeData.source_url || newSchemeData.official_portal_url,
            document_reference: 'GOV-NOTIFICATION'
          }
        ],
        eligibility_rules: [
          {
            rule_code: `${newSchemeData.code}-R1`,
            field_name: 'domicile_state',
            operator: 'eq',
            target_value: 'Karnataka',
            description_en: 'Must be a permanent resident of Karnataka.',
            is_mandatory: true
          }
        ],
        required_documents: [
          {
            document_type_code: 'caste_income_cert',
            document_name: 'Caste & Income Certificate',
            is_mandatory: true
          }
        ]
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create scheme.');
    }
  };

  const handleToggleUserActive = async (userRecord: any) => {
    const newActiveState = !userRecord.is_active;
    if (!confirm(`Are you sure you want to ${newActiveState ? 'activate' : 'suspend'} user ${userRecord.email}?`)) return;

    try {
      await api.updateUserStatus(userRecord.id, { is_active: newActiveState });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-[#858585]">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E5E5] rounded-full flex items-center justify-center mx-auto text-[#DC2626]">
          <GovIcon name="lock" className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#DC2626]">
            Restricted Access
          </p>
          <h2 className="text-2xl font-semibold text-[#111111]">
            Operations Console
          </h2>
        </div>
        <p className="text-xs text-[#555555] max-w-sm mx-auto leading-relaxed">
          Administrative privileges are required to inspect the publishing workflow and audit trail. Test account: <code className="bg-[#F7F7F6] px-1.5 py-0.5 rounded border border-[#E5E5E5] text-[#111111]">admin@jansetu.gov.in</code>
        </p>
        <div className="pt-2">
          <Link href="/auth/login">
            <Button variant="primary" size="md">
              Sign In as Administrator
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Masthead */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-2 py-0.5 rounded">
              Administrative Console
            </span>
            <span className="hidden sm:inline text-xs text-[#858585]">
              Privileged Session Active
            </span>
          </div>
          <div className="text-xs text-[#858585]">
            Operator: <strong className="text-[#111111]">{user.email}</strong>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] tracking-tight">
              Publishing & Governance Desk
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] max-w-2xl leading-relaxed">
              Maintain statutory scheme lifecycle verifications, monitor document scan health rates, manage citizen accounts, and inspect immutable audit logs.
            </p>
          </div>

          <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
            <GovIcon name="plus" className="w-4 h-4 mr-2" />
            Add Verified Scheme
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E5E5E5] gap-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Platform Overview', count: null },
          { key: 'schemes', label: 'Scheme Catalog & Publishing', count: schemes.length },
          { key: 'users', label: 'Citizens & Roles', count: usersList.length },
          { key: 'audit', label: 'Immutable Audit Trail', count: auditLogs.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-medium tracking-wide transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#111111] text-[#111111] font-semibold bg-[#FFFFFF]'
                : 'border-transparent text-[#858585] hover:text-[#111111] hover:bg-[#FFFFFF]/50'
            }`}
          >
            {tab.label} {tab.count !== null && <span className="text-[11px] text-[#858585]">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858585] block">
                Total Citizens
              </span>
              <div className="text-3xl font-semibold text-[#111111]">
                {overview.users?.citizens ?? 0}
              </div>
              <span className="text-xs text-[#858585] block">
                Registered Accounts: {overview.users?.total ?? 0}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#15803D] block">
                Published Schemes
              </span>
              <div className="text-3xl font-semibold text-[#15803D]">
                {overview.schemes?.published ?? 0}
              </div>
              <span className="text-xs text-[#858585] block">
                Live Catalog: {overview.schemes?.total ?? 0}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B45309] block">
                Under Review
              </span>
              <div className="text-3xl font-semibold text-[#B45309]">
                {overview.schemes?.under_review ?? 0}
              </div>
              <span className="text-xs text-[#B45309] block">
                Awaiting Audit Approval
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#111111] block">
                CV OCR Health
              </span>
              <div className="text-3xl font-semibold text-[#111111]">
                {overview.document_intelligence?.health_rate ?? 100}%
              </div>
              <span className="text-xs text-[#858585] block">
                {overview.document_intelligence?.total_processed ?? 0} Scans Evaluated
              </span>
            </div>
          </div>

          {/* Scheme Publishing Governance Flow */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858585] block">
                Governance Pipeline
              </span>
              <h3 className="text-base font-semibold text-[#111111]">
                Scheme Lifecycle Verification Standard
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg space-y-1">
                <span className="text-[10px] text-[#858585] block">STAGE 01</span>
                <p className="font-semibold text-[#111111]">Draft</p>
                <p className="text-[11px] text-[#555555]">Initial intake & parameter drafting</p>
              </div>

              <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg space-y-1">
                <span className="text-[10px] text-[#B45309] block">STAGE 02</span>
                <p className="font-semibold text-[#B45309]">Under Review</p>
                <p className="text-[11px] text-[#555555]">Legal & eligibility rule audit</p>
              </div>

              <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg space-y-1">
                <span className="text-[10px] text-[#111111] block">STAGE 03</span>
                <p className="font-semibold text-[#111111]">Source Verified</p>
                <p className="text-[11px] text-[#555555]">Official gazette URL linked</p>
              </div>

              <div className="p-3 bg-[#F7F7F6] border border-[#DCFCE7] rounded-lg space-y-1">
                <span className="text-[10px] text-[#15803D] block">STAGE 04</span>
                <p className="font-semibold text-[#15803D]">Published</p>
                <p className="text-[11px] text-[#555555]">Live in citizen discovery engine</p>
              </div>

              <div className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg space-y-1">
                <span className="text-[10px] text-[#858585] block">STAGE 05</span>
                <p className="font-semibold text-[#858585]">Archived</p>
                <p className="text-[11px] text-[#555555]">Superseded or lapsed scheme</p>
              </div>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed pt-1">
              Only schemes verified against authentic departmental gazette notifications may advance to "Published". All state transitions are permanently recorded in the immutable audit ledger.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMES MANAGEMENT */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F6] border-b border-[#E5E5E5] text-[#111111] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Scheme Title</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Rules</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Verified</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F7F6] transition-colors">
                    <td className="p-3.5 font-mono font-medium text-[#111111]">{s.code}</td>
                    <td className="p-3.5 font-semibold text-[#111111] max-w-xs">{s.title}</td>
                    <td className="p-3.5 text-[#555555] max-w-xs truncate">{s.department}</td>
                    <td className="p-3.5 capitalize text-[11px]">{s.government_level}</td>
                    <td className="p-3.5 font-mono text-[11px]">{s.rules_count}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                        s.verification_status === 'published'
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                          : s.verification_status === 'under_review'
                          ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#F7F7F6] border-[#E5E5E5] text-[#858585]'
                      }`}>
                        {s.verification_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#858585]">{s.last_verified_date}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedScheme(s);
                          setWorkflowStatus(s.verification_status);
                          setStatusNotes('');
                          setIsStatusModalOpen(true);
                        }}
                      >
                        Manage Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F6] border-b border-[#E5E5E5] text-[#111111] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Legal Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Jurisdiction</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Documents</th>
                  <th className="p-3.5">Enrolled</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F7F6] transition-colors">
                    <td className="p-3.5 font-semibold text-[#111111]">{u.full_name}</td>
                    <td className="p-3.5 text-[#111111] font-mono text-[11px]">{u.email}</td>
                    <td className="p-3.5 capitalize text-[11px] font-semibold">{u.role}</td>
                    <td className="p-3.5 text-[11px]">{u.state}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                        u.is_active
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">{u.documents_count}</td>
                    <td className="p-3.5 text-[11px] text-[#858585]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`text-xs font-semibold hover:underline ${
                            u.is_active ? 'text-[#DC2626]' : 'text-[#15803D]'
                          }`}
                        >
                          {u.is_active ? 'SUSPEND' : 'ACTIVATE'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F6] border-b border-[#E5E5E5] text-[#111111] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Admin Identity</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Immutable Audit Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F7F6] transition-colors">
                    <td className="p-3.5 text-[11px] text-[#858585]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-xs font-semibold text-[#111111]">{log.admin_email}</td>
                    <td className="p-3.5 font-mono text-xs text-[#111111] font-semibold">{log.action}</td>
                    <td className="p-3.5 capitalize text-[11px]">{log.resource_type}</td>
                    <td className="p-3.5 text-[#555555] font-mono text-[10px] max-w-sm truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Workflow Modal */}
      {isStatusModalOpen && selectedScheme && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Publishing Workflow: ${selectedScheme.title}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">
                Verification & Publishing Stage:
              </label>
              <select
                value={workflowStatus}
                onChange={(e) => setWorkflowStatus(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
              >
                <option value="draft">Draft (Initial Entry)</option>
                <option value="under_review">Under Review (Legal/Dept Audit)</option>
                <option value="verified">Verified (Official Source Confirmed)</option>
                <option value="published">Published (Visible to Citizens)</option>
                <option value="archived">Archived (Expired/Superseded)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">
                Audit Notes:
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Verified official notification circular dated 2026-10"
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateSchemeWorkflow}>
                Update Workflow Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Scheme Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Verified Government Scheme"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Scheme Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-BCWD-07"
                  value={newSchemeData.code}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, code: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Government Level</label>
                <select
                  value={newSchemeData.government_level}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, government_level: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
                >
                  <option value="karnataka">Karnataka State</option>
                  <option value="central">Central Govt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Scheme Title (English)</label>
                <input
                  type="text"
                  required
                  value={newSchemeData.title}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, title: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Kannada Title</label>
                <input
                  type="text"
                  value={newSchemeData.kannada_title}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, kannada_title: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newSchemeData.department}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, department: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newSchemeData.category}
                  onChange={(e) => setNewSchemeData({ ...newSchemeData, category: e.target.value })}
                  className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Official Portal URL</label>
              <input
                type="url"
                required
                value={newSchemeData.official_portal_url}
                onChange={(e) => setNewSchemeData({ ...newSchemeData, official_portal_url: e.target.value })}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Benefits Summary</label>
              <textarea
                required
                rows={2}
                value={newSchemeData.benefits_summary}
                onChange={(e) => setNewSchemeData({ ...newSchemeData, benefits_summary: e.target.value })}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Short Description</label>
              <textarea
                required
                rows={2}
                value={newSchemeData.short_description}
                onChange={(e) => setNewSchemeData({ ...newSchemeData, short_description: e.target.value })}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111111] uppercase tracking-wider mb-1">Detailed Description & Steps</label>
              <textarea
                required
                rows={3}
                value={newSchemeData.detailed_description}
                onChange={(e) => {
                  setNewSchemeData({
                    ...newSchemeData,
                    detailed_description: e.target.value,
                    application_process: e.target.value,
                    target_beneficiaries: 'Eligible Karnataka Citizens'
                  });
                }}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create & Add to Workflow
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
