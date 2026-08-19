import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Award, AlertCircle, RefreshCw, CheckCircle2, UserCheck, Hash, Wallet, ShieldAlert, Key, AlertTriangle } from 'lucide-react';
import { AcademicCredential, CredentialType, StudentProfile, ConnectedWalletInfo } from '../types';
import { generateCredentialId } from '../services/credentialService';
import { calculateCredentialHash } from '../utils/hashUtils';
import { blockchainService, PRESET_WALLETS } from '../services/blockchainService';

interface CreateCredentialModalProps {
  institutionName: string;
  students: StudentProfile[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentialData: Omit<AcademicCredential, 'id' | 'createdAt' | 'status' | 'certificateHash'> & { 
    customId?: string;
    autoRegisterOnBlockchain?: boolean;
  }) => Promise<void>;
  onWalletChanged?: () => void;
}

export const CreateCredentialModal: React.FC<CreateCredentialModalProps> = ({
  institutionName,
  students,
  isOpen,
  onClose,
  onSubmit,
  onWalletChanged,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [degree, setDegree] = useState('Bachelor of Technology (B.Tech)');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gradeOrCgpa, setGradeOrCgpa] = useState('9.2 / 10.0');
  const [credentialType, setCredentialType] = useState<CredentialType>('Degree Certificate');
  const [remarks, setRemarks] = useState('');
  const [registerOnChain, setRegisterOnChain] = useState(true);
  const [generatedId, setGeneratedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active connected wallet for authorization check
  const [walletInfo, setWalletInfo] = useState<ConnectedWalletInfo | null>(null);
  const [activeWalletAddr, setActiveWalletAddr] = useState<string>(blockchainService.getActiveWalletAddress());

  // Live Cryptographic Hash Preview
  const [previewHash, setPreviewHash] = useState<string>('');
  const [previewCanonical, setPreviewCanonical] = useState<string>('');

  // Load wallet status on open or active wallet change
  const refreshWalletInfo = async () => {
    const info = await blockchainService.getWalletInfo();
    setWalletInfo(info);
    setActiveWalletAddr(info.address);
  };

  useEffect(() => {
    if (isOpen) {
      setGeneratedId(generateCredentialId());
      setError(null);
      refreshWalletInfo();
    }
  }, [isOpen]);

  const handleWalletSelect = async (addr: string) => {
    blockchainService.setActiveWalletAddress(addr);
    await refreshWalletInfo();
    if (onWalletChanged) onWalletChanged();
  };

  // Compute live SHA-256 hash preview via Web Crypto API on field change
  useEffect(() => {
    let isCurrent = true;
    const computePreview = async () => {
      if (!generatedId) return;
      try {
        const { canonicalString, certificateHash } = await calculateCredentialHash({
          id: generatedId,
          studentName: studentName || 'STUDENT NAME',
          institutionName: institutionName || 'INSTITUTION',
          degree: degree || 'DEGREE',
          branch: branch || 'BRANCH',
          graduationYear: graduationYear || new Date().getFullYear(),
          issueDate: issueDate || new Date().toISOString().split('T')[0],
          gradeOrCgpa: gradeOrCgpa || 'GRADE',
        });
        if (isCurrent) {
          setPreviewHash(certificateHash);
          setPreviewCanonical(canonicalString);
        }
      } catch (err) {
        console.error('Error computing hash preview:', err);
      }
    };

    computePreview();
    return () => {
      isCurrent = false;
    };
  }, [generatedId, studentName, institutionName, degree, branch, graduationYear, issueDate, gradeOrCgpa]);

  // When selecting an existing student, autofill details
  const handleStudentSelect = (stuId: string) => {
    setSelectedStudentId(stuId);
    if (!stuId) return;

    const matched = students.find((s) => s.studentId === stuId);
    if (matched) {
      setStudentName(matched.name);
      setStudentId(matched.studentId);
      setStudentEmail(matched.email);
      setDegree(matched.degree || 'Bachelor of Technology (B.Tech)');
      setBranch(matched.branch || 'Computer Science and Engineering');
      setGraduationYear(matched.graduationYear || new Date().getFullYear());
      if (matched.cgpa) {
        setGradeOrCgpa(matched.cgpa);
      }
    }
  };

  const handleRegenerateId = () => {
    setGeneratedId(generateCredentialId());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!studentId.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (!degree.trim()) {
      setError('Degree is required.');
      return;
    }
    if (!branch.trim()) {
      setError('Branch / Specialization is required.');
      return;
    }
    if (!gradeOrCgpa.trim()) {
      setError('Grade / CGPA is required.');
      return;
    }
    if (!issueDate) {
      setError('Issue Date is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        studentName: studentName.trim(),
        studentId: studentId.trim().toUpperCase(),
        studentEmail: studentEmail.trim() || undefined,
        institutionName: institutionName.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduationYear: Number(graduationYear),
        issueDate,
        gradeOrCgpa: gradeOrCgpa.trim(),
        credentialType,
        remarks: remarks.trim() || undefined,
        customId: generatedId,
        autoRegisterOnBlockchain: registerOnChain,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to issue academic credential.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Issue Academic Credential</h2>
              <p className="text-xs text-slate-500">Enforces on-chain TrustCredRegistry authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Smart Contract Revert Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Smart Contract Transaction Reverted</span>
              </div>
              <p className="font-medium">{error}</p>
              <div className="pt-1 text-[11px] text-rose-700">
                <span>Security Enforcement: </span>
                <code className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-900">TrustCredRegistry.sol → onlyAuthorizedIssuer (msg.sender)</code>
              </div>
            </div>
          )}

          {/* 🔒 Blockchain Issuer Wallet Authorization Status */}
          <div className="p-4 rounded-xl border bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Institutional Signing Wallet (msg.sender)
                </span>
              </div>
              {walletInfo?.isAuthorized ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Authorized On-Chain Issuer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Unauthorized Signer Wallet
                </span>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{institutionName}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-indigo-700">
                {activeWalletAddr || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Contract: <code className="font-mono text-slate-700">TrustCredRegistry.sol (onlyAuthorizedIssuer)</code></span>
            </div>
          </div>

          {/* Unique Credential ID Preview */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-semibold text-indigo-900 uppercase tracking-wide">
                Auto-Generated Credential ID
              </span>
              <span className="font-mono text-sm font-bold text-indigo-700">{generatedId}</span>
            </div>
            <button
              type="button"
              onClick={handleRegenerateId}
              title="Generate new ID"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate ID</span>
            </button>
          </div>

          {/* Live SHA-256 Certificate Hash Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Live SHA-256 Certificate Hash (Web Crypto API)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                64-Hex Characters
              </span>
            </div>
            <div className="bg-black/60 p-2.5 rounded font-mono text-xs text-indigo-300 break-all select-all border border-slate-800">
              {previewHash || 'Generating 64-char SHA-256 hash...'}
            </div>
            <p className="text-[10px] text-slate-400">
              Calculated deterministically from ID, student name, institution, degree, branch, year, date, and grade.
            </p>
          </div>

          {/* Quick Student Autofill Picker */}
          {students.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                Quick-Select Registered Student (Optional Autofill)
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose registered student or type below --</option>
                {students.map((s, idx) => (
                  <option key={s.id || `${s.studentId}-${idx}`} value={s.studentId}>
                    {s.name} ({s.studentId}) - {s.branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Divya Mudavath"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STU-2022-9102"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issuing Institution Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={institutionName}
              className="w-full text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-700 px-3 py-2 cursor-not-allowed font-medium"
            />
          </div>

          {/* Academic Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credential Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value as CredentialType)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="Official Transcript">Official Transcript</option>
                <option value="Diploma">Diploma</option>
                <option value="Postgraduate Degree">Postgraduate Degree</option>
                <option value="Course Certificate">Course Certificate</option>
                <option value="Honor Award">Honor Award</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree Awarded <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Specialization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Artificial Intelligence & Data Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Graduation Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1980}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grade / CGPA / Honors <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9.68 / 10.0 (Distinction)"
                value={gradeOrCgpa}
                onChange={(e) => setGradeOrCgpa(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Remarks / Citation (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Graduated Summa Cum Laude with honors."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Blockchain Smart Contract Registration Option */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="registerOnChain"
              checked={registerOnChain}
              onChange={(e) => setRegisterOnChain(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="registerOnChain" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">Register on Blockchain (`TrustCredRegistry.sol`)</span>
              <span className="text-[11px] text-slate-600">
                Immediately call <code className="font-mono text-indigo-700 bg-white px-1 py-0.5 rounded border border-indigo-100">registerCredential(id, hash, institution)</code>. The Solidity smart contract will verify <code className="font-mono text-indigo-700">msg.sender</code> against authorized issuers.
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-mono">
              Sender: <span className="font-bold text-slate-700">{walletInfo?.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : 'Connecting...'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying msg.sender & Issuing...' : 'Issue & Seal Credential'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
