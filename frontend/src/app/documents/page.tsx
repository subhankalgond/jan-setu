'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('caste_income_cert');
  const [simulatedText, setSimulatedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviewingDoc, setReviewingDoc] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState('');

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await api.listDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a PDF, JPG, or PNG document.');
      return;
    }

    setUploadLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);
    if (simulatedText.trim()) {
      formData.append('simulated_text', simulatedText.trim());
    }

    try {
      const res = await api.uploadDocument(formData);
      setSelectedFile(null);
      setSimulatedText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadDocuments();

      const newlyUploaded = {
        id: res.document_id,
        file_name: res.file_name,
        document_type: res.document_type,
        quality: res.quality,
        extracted_fields: res.extracted_fields
      };
      openReviewModal(newlyUploaded);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please check file format and size.');
    } finally {
      setUploadLoading(false);
    }
  };

  const openReviewModal = (doc: any) => {
    setReviewingDoc(doc);
    const initialValues: Record<string, string> = {};
    doc.extracted_fields?.forEach((f: any) => {
      initialValues[f.id] = f.user_corrected_value || f.normalized_value || f.raw_value || '';
    });
    setEditableFields(initialValues);
    setIsReviewOpen(true);
  };

  const handleApproveDocument = async () => {
    if (!reviewingDoc) return;

    const corrections = reviewingDoc.extracted_fields?.map((f: any) => ({
      field_id: f.id,
      corrected_value: editableFields[f.id] || '',
      is_approved: true
    }));

    try {
      await api.reviewDocument(reviewingDoc.id, {
        action: 'approve',
        corrections,
        notes: reviewNotes
      });
      setIsReviewOpen(false);
      setReviewingDoc(null);
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to submit approval.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to securely purge this document from your private vault?')) return;
    try {
      await api.deleteDocument(docId);
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#555555]">
          <span className="font-semibold text-[#111111] uppercase tracking-wider">Citizen Archive</span>
          <span>&bull;</span>
          <span>Private Document Vault</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Document Center & Scanner
        </h1>
        <p className="text-xs sm:text-sm text-[#555555] max-w-3xl leading-relaxed">
          Upload certificates and identity records. Jan Setu detects blurriness and scan completeness using OpenCV, extracts critical certificate numbers (such as Nadakacheri RD numbers), and requires your manual approval before any data is utilized.
        </p>
      </div>

      {/* Upload and Quality Inspection Box */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b border-[#E5E5E5] pb-4 gap-2">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <GovIcon name="upload" className="w-5 h-5 text-[#111111]" />
            Upload Document for Quality Check & Field Extraction
          </h2>
          <span className="text-xs text-[#858585]">PDF, JPG, PNG &bull; Max 10 MB</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
            <GovIcon name="alert-triangle" className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Document Category:
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none transition-colors"
              >
                <option value="caste_income_cert">Caste & Income Certificate (Nadakacheri RD Number)</option>
                <option value="sslc_marksheet">SSLC / 10th Marks Card</option>
                <option value="degree_diploma_marksheet">Degree / Diploma Passing Certificate</option>
                <option value="ration_card">Ration Card (BPL / AAY / APL)</option>
                <option value="aadhaar_card">Aadhaar Card</option>
                <option value="rtc_pahani">Land RTC / Pahani Record</option>
                <option value="bank_passbook">Aadhaar Seeded Bank Passbook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Select Document File:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl px-3 py-1.5 text-xs text-[#111111] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#111111] file:text-white"
              />
            </div>
          </div>

          {/* Quick simulation helper */}
          <div className="p-3 bg-[#F7F7F6] rounded-xl border border-[#E5E5E5] space-y-1 text-xs">
            <span className="text-[11px] font-semibold text-[#555555] block">
              Optional Synthetic OCR Simulation Text (For Testing):
            </span>
            <input
              type="text"
              value={simulatedText}
              onChange={(e) => setSimulatedText(e.target.value)}
              placeholder="e.g. RD00384729104 Name: Kumari Pooja Patil DOB: 14/05/2003 Income: 120000 Cat-1"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-1.5 text-xs text-[#111111] font-mono placeholder-[#858585] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={uploadLoading}>
              <GovIcon name="upload" className="w-4 h-4 mr-1.5" />
              Upload & Scan Document
            </Button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents Archive Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
            <GovIcon name="document-check" className="w-5 h-5 text-[#111111]" />
            Your Document Vault ({documents.length})
          </h2>
          <span className="text-xs text-[#555555]">All files stored in private secure storage</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#555555]">
            Loading your document archive...
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-[#FFFFFF] border-2 border-dashed border-[#E5E5E5] rounded-2xl p-12 text-center space-y-3 text-xs">
            <GovIcon name="document" className="w-10 h-10 text-[#858585] mx-auto" />
            <h3 className="text-sm font-bold text-[#111111]">Vault is Currently Empty</h3>
            <p className="text-[#555555] max-w-sm mx-auto leading-relaxed">
              Upload your certificates or marks cards above to prepare checklists and application mappings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const isApproved = doc.status === 'approved_by_user';
              const isBlurry = doc.is_blurry;

              return (
                <div
                  key={doc.id}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                        {doc.document_type.replace(/_/g, ' ')}
                      </span>
                      {isApproved ? (
                        <Badge variant="verified">Approved by Citizen</Badge>
                      ) : (
                        <Badge variant="pending">Needs Review</Badge>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#111111] truncate">{doc.file_name}</h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#858585]">
                      <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                      <span>&bull;</span>
                      <span>Quality: {(doc.quality_score * 100).toFixed(0)}%</span>
                      {isBlurry && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                            <GovIcon name="alert-triangle" className="w-3.5 h-3.5" /> Blurry
                          </span>
                        </>
                      )}
                      {doc.expiry_date && (
                        <>
                          <span>&bull;</span>
                          <span>Valid: {doc.expiry_date}</span>
                        </>
                      )}
                    </div>

                    {/* Extracted Fields */}
                    <div className="pt-2 border-t border-[#E5E5E5] space-y-1 text-xs">
                      <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block">
                        Extracted Fields:
                      </span>
                      <div className="space-y-1">
                        {doc.extracted_fields?.map((f: any) => (
                          <div key={f.id} className="flex justify-between text-xs">
                            <span className="text-[#555555] capitalize">{f.field_name.replace(/_/g, ' ')}:</span>
                            <span className="font-mono font-medium text-[#111111] truncate max-w-[190px]">
                              {f.user_corrected_value || f.normalized_value || 'Pending Verification'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                    <Button
                      variant={isApproved ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => openReviewModal(doc)}
                    >
                      {isApproved ? 'Edit & Verify' : 'Review & Approve'}
                    </Button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 font-medium"
                    >
                      <GovIcon name="trash" className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Citizen Review Modal */}
      {isReviewOpen && reviewingDoc && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Review Extracted Fields: ${reviewingDoc.file_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="p-3.5 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl text-xs text-[#555555] space-y-1">
              <p className="font-bold text-[#111111]">Citizen Consent Requirement:</p>
              <p className="leading-relaxed">
                Please inspect each extracted field below, correct any discrepancies, and approve the data before it can be used for application preparation.
              </p>
            </div>

            {reviewingDoc.quality?.is_blurry && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626] flex items-start gap-2">
                <GovIcon name="alert-triangle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Blurry Image Alert: </span>
                  Laplacian variance indicates poor focus. Verify certificate numbers carefully.
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Extracted Fields:
              </h4>

              {reviewingDoc.extracted_fields?.map((f: any) => (
                <div key={f.id} className="p-3 bg-[#F7F7F6] border border-[#E5E5E5] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[#111111] capitalize">
                      {f.field_name.replace(/_/g, ' ')}
                    </label>
                    <span className="font-mono text-[11px] text-[#858585]">
                      Confidence: {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editableFields[f.id] ?? ''}
                    onChange={(e) => setEditableFields({ ...editableFields, [f.id]: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-[#111111] font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Citizen Review Notes (Optional):
              </label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Verified against original Nadakacheri certificate"
                className="w-full bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-1.5 text-xs text-[#111111] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5E5] text-xs">
              <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleApproveDocument}>
                <GovIcon name="check" className="w-4 h-4 mr-1.5" />
                Approve Extracted Data
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
