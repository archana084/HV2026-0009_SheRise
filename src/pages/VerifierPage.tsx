import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, Building2, User, Award, Calendar, GraduationCap, Copy, Check, Eye, Sparkles, ArrowRight, ShieldAlert, Cpu, Layers, Terminal, Hash, ExternalLink, AlertTriangle, RefreshCw, HelpCircle, FileCheck, CheckCircle } from 'lucide-react';
import { AcademicCredential, VerificationResult } from '../types';
import { credentialService } from '../services/credentialService';
import { CredentialModal } from '../components/CredentialModal';
import { BlockchainNetworkModal } from '../components/BlockchainNetworkModal';
import { TamperCredentialModal } from '../components/TamperCredentialModal';

interface VerifierPageProps {
  initialCredentialId?: string;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const VerifierPage: React.FC<VerifierPageProps> = ({
  initialCredentialId,
  onShowToast,
}) => {
  const [searchMode, setSearchMode] = useState<'credential' | 'student'>('credential');
  const [studentIdQuery, setStudentIdQuery] = useState('');
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [studentResults, setStudentResults] = useState<AcademicCredential[] | null>(null);
  const [hasSearchedStudent, setHasSearchedStudent] = useState(false);
  const [verifyingCredentialId, setVerifyingCredentialId] = useState<string | null>(null);

  const [queryId, setQueryId] = useState(initialCredentialId || '');
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [selectedCredentialForModal, setSelectedCredentialForModal] = useState<AcademicCredential | null>(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetCredential, setTamperTargetCredential] = useState<AcademicCredential | null>(null);
  
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedOriginalHash, setCopiedOriginalHash] = useState(false);
  const [copiedCurrentHash, setCopiedCurrentHash] = useState(false);

  const studentPresets = [
    { id: 'STU-2022-9102', label: 'Divya Mudavath (2 Credentials)', desc: 'B.Tech AI & Transcript' },
    { id: 'STU-2022-8419', label: 'Aarav Patel (1 Credential)', desc: 'B.Tech Computer Science' },
    { id: 'STU-2021-3310', label: 'Elena Rostova (Revoked)', desc: 'M.S. Software Eng' },
  ];

  const handleSearchByStudentId = async (targetStudentId?: string) => {
    const idToSearch = (targetStudentId || studentIdQuery).trim();
    if (!idToSearch) {
      onShowToast('Please enter a Student ID', 'e.g. STU-2022-9102', 'info');
      return;
    }

    setIsSearchingStudent(true);
    try {
      const results = await credentialService.getCredentialsByStudentId(idToSearch);
      setStudentResults(results);
      setHasSearchedStudent(true);
      if (results.length === 0) {
        onShowToast('No Credentials Found', `No credentials were found for this Student ID.`, 'info');
      } else {
        onShowToast(`Found ${results.length} Credential${results.length > 1 ? 's' : ''}`, `Showing credentials for ${idToSearch}`, 'success');
      }
    } catch (err: any) {
      onShowToast('Search Error', err?.message || 'Search failed', 'error');
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const samplePresets = [
    { 
      id: 'TC-2026-89421', 
      label: '🟢 Valid Record', 
      name: 'Divya Mudavath', 
      desc: 'B.Tech AI & Data Science (Exact Match)',
      type: 'valid' 
    },
    { 
      id: 'TC-2026-77319', 
      label: '⚡ Sample Record', 
      name: 'Aarav Patel', 
      desc: 'B.Tech Computer Science',
      type: 'tamper-target' 
    },
    { 
      id: 'TC-2025-41092', 
      label: '🔴 Revoked Record', 
      name: 'Elena Rostova', 
      desc: 'M.S. Software Eng (Revoked on-chain)',
      type: 'revoked' 
    },
  ];

  const handleSearch = async (targetId?: string) => {
    const idToSearch = (targetId || queryId).trim();
    if (!idToSearch) {
      onShowToast('Please enter a Credential ID', 'e.g. TC-2026-89421', 'info');
      return;
    }

    setIsSearching(true);
    try {
      const result = await credentialService.verifyCredential(idToSearch);
      setVerificationResult(result);

      if (result.status === 'VERIFIED') {
        onShowToast('Credential VERIFIED', 'Cryptographic SHA-256 hash matches blockchain record', 'success');
      } else if (result.status === 'TAMPERED') {
        onShowToast('INVALID — TAMPERED', 'Current academic data does not match blockchain hash', 'error');
      } else if (result.status === 'REVOKED') {
        onShowToast('REVOKED', 'This record is marked revoked on the blockchain', 'error');
      } else {
        onShowToast('Not Found', 'No blockchain record exists for this Credential ID', 'info');
      }
    } catch (err: any) {
      onShowToast('Verification Error', err?.message || 'Search failed', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialCredentialId) {
      setQueryId(initialCredentialId);
      handleSearch(initialCredentialId);
    }
  }, [initialCredentialId]);

  const handleCopy = (text: string, type: 'id' | 'tx' | 'origHash' | 'currHash') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === 'tx') {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else if (type === 'origHash') {
      setCopiedOriginalHash(true);
      setTimeout(() => setCopiedOriginalHash(false), 2000);
    } else if (type === 'currHash') {
      setCopiedCurrentHash(true);
      setTimeout(() => setCopiedCurrentHash(false), 2000);
    }
    onShowToast('Copied to Clipboard', text.slice(0, 24) + '...', 'info');
  };

  const handleUsePreset = (presetId: string) => {
    setQueryId(presetId);
    handleSearch(presetId);
  };

  const handleQuickTamperTest = async (credentialId: string) => {
    try {
      const cred = await credentialService.getCredentialById(credentialId);
      if (cred) {
        setTamperTargetCredential(cred);
        setIsTamperModalOpen(true);
      } else {
        onShowToast('Credential Not Found', `Cannot locate ${credentialId}`, 'error');
      }
    } catch (e: any) {
      onShowToast('Error', e.message, 'error');
    }
  };

  const handleQuickPresetTamperAndVerify = async (credentialId: string) => {
    try {
      setIsSearching(true);
      await credentialService.tamperCredential(credentialId, '9.99 / 10.0 (Tampered Gold Medal)', 'Master of Artificial Intelligence');
      onShowToast('Tampered Local Academic Record', 'Altered CGPA & Degree. Blockchain record remains unchanged.', 'info');
      setQueryId(credentialId);
      await handleSearch(credentialId);
    } catch (err: any) {
      onShowToast('Tamper failed', err?.message, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickRevokeAndVerify = async (credentialId: string) => {
    try {
      setIsSearching(true);
      await credentialService.revokeCredentialOnBlockchain(credentialId);
      onShowToast('Revoked on Blockchain', 'Set revoked = true on TrustCredRegistry.', 'info');
      setQueryId(credentialId);
      await handleSearch(credentialId);
    } catch (err: any) {
      onShowToast('Revocation error', err?.message, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-100">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
          TrustCred
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Digital Credential Verification
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Verify academic credentials using independent SHA-256 Web Crypto recalculation against the immutable <strong className="font-mono text-purple-700">TrustCredRegistry</strong> smart contract.
        </p>

        <div className="pt-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setIsNetworkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Connected to TrustCredRegistry (Solidity EVM)</span>
          </button>
        </div>
      </div>

      {/* Search Box Card with Mode Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {/* Mode Toggle Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
          <button
            type="button"
            onClick={() => setSearchMode('credential')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              searchMode === 'credential'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Search by Credential ID</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('student')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              searchMode === 'student'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Search by Student ID</span>
          </button>
        </div>

        {/* Tab 1: Search by Credential ID */}
        {searchMode === 'credential' ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter Credential ID (e.g. TC-2026-89421)"
                  value={queryId}
                  onChange={(e) => setQueryId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSearching ? 'Verifying on Chain...' : 'Verify on Blockchain'}</span>
              </button>
            </form>

            {/* Presets Bar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Sample Verification Records:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUsePreset(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-mono transition-colors font-medium"
                    >
                      {s.label} ({s.id})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamper Verification Action */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Tamper Verification:</strong> Modify academic data while keeping on-chain hash fixed</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickTamperTest('TC-2026-77319')}
                    className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold transition-colors text-[11px]"
                  >
                    Simulate Data Alteration
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetTamperAndVerify('TC-2026-77319')}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors text-[11px]"
                  >
                    1-Click Alter & Verify
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Tab 2: Search by Student ID */
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchByStudentId();
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter Student ID (e.g. STU-2022-9102)"
                  value={studentIdQuery}
                  onChange={(e) => setStudentIdQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingStudent}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{isSearchingStudent ? 'Finding...' : 'Find Credentials'}</span>
              </button>
            </form>

            {/* Quick Student ID Presets */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Student ID Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {studentPresets.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setStudentIdQuery(sp.id);
                      handleSearchByStudentId(sp.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-mono transition-colors font-medium"
                  >
                    {sp.label} ({sp.id})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student ID Multi-Credential Results Display */}
      {searchMode === 'student' && hasSearchedStudent && studentResults && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {studentResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                ⚪ NO CREDENTIALS FOUND
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No credentials were found for this Student ID. Please verify the ID and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Student ID: <span className="font-mono font-bold text-slate-900">{studentIdQuery || studentResults[0]?.studentId}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Credentials Found: {studentResults.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Select a certificate below to verify on-chain
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentResults.map((cred, index) => (
                  <div
                    key={cred.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                      verifyingCredentialId === cred.id || queryId === cred.id
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Credential {index + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{cred.credentialType}</span>
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {cred.id}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Student:</span>
                        <span className="font-bold text-slate-900">{cred.studentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Degree:</span>
                        <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]" title={cred.degree}>
                          {cred.degree}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Specialization:</span>
                        <span className="text-slate-700 text-right truncate max-w-[200px]" title={cred.branch}>
                          {cred.branch}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Academic Score:</span>
                        <span className="font-mono font-medium text-slate-900">{cred.gradeOrCgpa}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Issuing Authority:</span>
                        <span className="text-slate-700 text-right truncate max-w-[190px]" title={cred.institutionName}>
                          {cred.institutionName}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCredentialForModal(cred)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingCredentialId(cred.id);
                          setQueryId(cred.id);
                          handleSearch(cred.id);
                        }}
                        disabled={isSearching}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isSearching && queryId === cred.id ? 'Verifying...' : 'Verify Certificate'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Result Display */}
      {verificationResult && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-200 space-y-6">
          
          {/* ========================================================================= */}
          {/* CASE 1: 🟢 VERIFIED (Hashes Match & Revoked == False) */}
          {/* ========================================================================= */}
          {verificationResult.status === 'VERIFIED' && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-lg overflow-hidden">
              {/* Primary Status Banner */}
              <div className="bg-emerald-600 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-800 text-emerald-100 uppercase tracking-wide mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      ✓ CREDENTIAL VERIFIED
                    </div>
                    <h3 className="font-bold text-lg leading-snug">
                      {verificationResult.message}
                    </h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      {verificationResult.explanation}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-emerald-800/90 px-3.5 py-2 rounded-xl text-xs font-mono shrink-0">
                  <span className="text-emerald-200">On-Chain State:</span>
                  <span className="font-bold text-white uppercase">Valid & Sealed</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 5-Point Verification Audit Checklist */}
                <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Credential Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ SHA-256 Hash Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Blockchain Record Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Credential Not Revoked</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 md:col-span-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900">✓ Credential Authentic</span>
                  </div>
                </div>

                {/* 1. Academic Details */}
                {verificationResult.credential && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student & Degree */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                          Conferred Student
                        </span>
                        <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                          {verificationResult.credential.studentName}
                        </h4>
                        <p className="text-xs font-mono text-slate-500">
                          Student ID: {verificationResult.credential.studentId}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Degree Awarded</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {verificationResult.credential.degree}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Branch / Specialization</span>
                          <span className="font-semibold text-slate-800">
                            {verificationResult.credential.branch}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Graduation Year</span>
                            <span className="font-bold text-slate-900">{verificationResult.credential.graduationYear}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Academic Performance</span>
                            <span className="font-bold text-emerald-800 font-mono">{verificationResult.credential.gradeOrCgpa}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Issuing Institution & ID */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                          Issuing Institution
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{verificationResult.credential.institutionName}</span>
                        </h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {verificationResult.credential.credentialType}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Credential ID:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-700">{verificationResult.credential.id}</span>
                            <button
                              onClick={() => handleCopy(verificationResult.credential!.id, 'id')}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Copy ID"
                            >
                              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Date of Issuance:</span>
                          <span className="font-medium text-slate-900">{verificationResult.credential.issueDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Blockchain Status:</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Registered (revoked = false)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SHA-256 Hash Comparison Panel (Exact Match) */}
                <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-300 text-sm">SHA-256 Cryptographic Hash Comparison</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Independent Web Crypto Calculation vs Smart Contract</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      EXACT SHA-256 MATCH
                    </span>
                  </div>

                  {/* Hash Visualizer */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          Original Blockchain Hash (TrustCredRegistry.sol):
                        </span>
                        <button
                          onClick={() => handleCopy(verificationResult.originalBlockchainHash || '', 'origHash')}
                          className="text-purple-400 hover:text-purple-200 inline-flex items-center gap-1 font-mono text-[10px]"
                        >
                          {copiedOriginalHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedOriginalHash ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="bg-black/80 p-2.5 rounded-lg font-mono text-xs text-purple-200 break-all select-all border border-purple-900/60">
                        {verificationResult.originalBlockchainHash}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-emerald-400" />
                          Current Calculated Hash (Web Crypto API):
                        </span>
                        <button
                          onClick={() => handleCopy(verificationResult.currentCalculatedHash || '', 'currHash')}
                          className="text-emerald-400 hover:text-emerald-200 inline-flex items-center gap-1 font-mono text-[10px]"
                        >
                          {copiedCurrentHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCurrentHash ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="bg-black/80 p-2.5 rounded-lg font-mono text-xs text-emerald-200 break-all select-all border border-emerald-900/60">
                        {verificationResult.currentCalculatedHash}
                      </div>
                    </div>
                  </div>

                  {/* Transaction & Block Meta */}
                  {verificationResult.blockchainRecord && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-semibold block">Transaction Hash</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-purple-300 truncate max-w-[200px]" title={verificationResult.blockchainRecord.txHash}>
                            {verificationResult.blockchainRecord.txHash}
                          </span>
                          <button onClick={() => handleCopy(verificationResult.blockchainRecord!.txHash || '', 'tx')} className="text-slate-400 hover:text-purple-300">
                            {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-semibold block">Block Number & Timestamp</span>
                        <span className="font-mono text-slate-300 mt-0.5 block">
                          Block #{verificationResult.blockchainRecord.blockNumber || 1042} • {new Date(verificationResult.blockchainRecord.issueTimestamp * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500">
                    Cryptographic integrity confirmed: Academic data matches the on-chain immutable seal.
                  </p>

                  {verificationResult.credential && (
                    <button
                      onClick={() => setSelectedCredentialForModal(verificationResult.credential!)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Official Certificate Document</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE 2: 🔴 INVALID — CERTIFICATE TAMPERED (Hashes Differ & Revoked == False) */}
          {/* ========================================================================= */}
          {verificationResult.status === 'TAMPERED' && (
            <div className="bg-white rounded-2xl border-2 border-rose-500 shadow-xl overflow-hidden animate-in fade-in">
              {/* Primary Tamper Warning Banner */}
              <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950 text-rose-200 uppercase tracking-wide mb-1 border border-rose-600">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                      ⚠ TAMPERING DETECTED
                    </div>
                    <h3 className="font-bold text-lg leading-snug">
                      {verificationResult.message}
                    </h3>
                    <p className="text-xs text-rose-100 mt-0.5">
                      {verificationResult.explanation}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-rose-950/90 px-3.5 py-2 rounded-xl text-xs font-mono shrink-0 border border-rose-700">
                  <span className="text-rose-300">Security Alert:</span>
                  <span className="font-bold text-white uppercase">HASH MISMATCH</span>
                </div>
              </div>

              {/* Tamper Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 5-Point Verification Audit Checklist */}
                <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-rose-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Credential Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-700">✕ SHA-256 Hash Mismatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Blockchain Record Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Credential Not Revoked</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 md:col-span-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-800">✕ Verification Failed: Data Tampered</span>
                  </div>
                </div>

                {/* Tamper Explanation Box */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-rose-950">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Cryptographic Integrity Failure</span>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-900">
                    The SHA-256 hash calculated from the current academic record <strong>does not match</strong> the original hash immutably recorded on the blockchain smart contract. One or more fields (e.g. Student Name, CGPA, Degree, or Graduation Year) have been modified after issuance.
                  </p>
                  <p className="text-[11px] font-bold text-rose-950 pt-1">
                    ⚠️ DO NOT TRUST THIS RECORD AS AUTHENTIC.
                  </p>
                </div>

                {/* Side-by-Side Cryptographic Hash Divergence Panel */}
                <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-rose-900/60 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-rose-300 text-sm">Cryptographic Digest Divergence</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Original On-Chain Hash vs Current Calculated Hash</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      MISMATCH DETECTED (0/64 MATCH)
                    </span>
                  </div>

                  {/* Hash Comparison Blocks */}
                  <div className="space-y-3">
                    {/* 1. Original Blockchain Hash */}
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          Original Blockchain Hash (Immutable at Issuance):
                        </span>
                        <button
                          onClick={() => handleCopy(verificationResult.originalBlockchainHash || '', 'origHash')}
                          className="text-purple-400 hover:text-purple-200 inline-flex items-center gap-1 font-mono text-[10px]"
                        >
                          {copiedOriginalHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedOriginalHash ? 'Copied' : 'Copy Hash'}</span>
                        </button>
                      </div>
                      <div className="bg-black/90 p-2.5 rounded-lg font-mono text-xs text-purple-200 break-all select-all border border-purple-900">
                        {verificationResult.originalBlockchainHash}
                      </div>
                    </div>

                    {/* 2. Current Calculated Hash */}
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-rose-400" />
                          Current Calculated Hash (From Altered Data):
                        </span>
                        <button
                          onClick={() => handleCopy(verificationResult.currentCalculatedHash || '', 'currHash')}
                          className="text-rose-400 hover:text-rose-200 inline-flex items-center gap-1 font-mono text-[10px]"
                        >
                          {copiedCurrentHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCurrentHash ? 'Copied' : 'Copy Hash'}</span>
                        </button>
                      </div>
                      <div className="bg-black/90 p-2.5 rounded-lg font-mono text-xs text-rose-200 break-all select-all border border-rose-900">
                        {verificationResult.currentCalculatedHash}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Current Modified Data */}
                {verificationResult.credential && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                      Current Academic Data Submitted for Verification:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Student Name:</span>
                        <span className="font-bold text-slate-900 text-sm">{verificationResult.credential.studentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Credential ID:</span>
                        <span className="font-mono font-bold text-indigo-700">{verificationResult.credential.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Degree & Branch:</span>
                        <span className="font-semibold text-slate-800">{verificationResult.credential.degree} ({verificationResult.credential.branch})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Grade / CGPA:</span>
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block font-mono">
                          {verificationResult.credential.gradeOrCgpa}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset / Restore Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">Want to restore original data?</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await credentialService.resetDemoData();
                      onShowToast('Data Restored', 'Reset demo records to original un-tampered state', 'info');
                      handleSearch();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Restore Original State</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE 3: 🔴 REVOKED (On-Chain Revoked == True) */}
          {/* ========================================================================= */}
          {verificationResult.status === 'REVOKED' && (
            <div className="bg-white rounded-2xl border-2 border-rose-600 shadow-xl overflow-hidden">
              {/* Primary Revocation Banner */}
              <div className="bg-rose-700 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950 text-rose-200 uppercase tracking-wide mb-1 border border-rose-600">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                      ⚠ CREDENTIAL REVOKED
                    </div>
                    <h3 className="font-bold text-lg leading-snug">
                      {verificationResult.message}
                    </h3>
                    <p className="text-xs text-rose-100 mt-0.5">
                      {verificationResult.explanation}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-rose-950/90 px-3.5 py-2 rounded-xl text-xs font-mono shrink-0 border border-rose-700">
                  <span className="text-rose-300">Smart Contract Flag:</span>
                  <span className="font-bold text-white uppercase">revoked = true</span>
                </div>
              </div>

              {/* Revocation Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 5-Point Verification Audit Checklist */}
                <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-rose-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Credential Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ SHA-256 Hash Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">✓ Blockchain Record Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-700">✕ Credential Revoked on Blockchain</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 md:col-span-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-800">✕ Verification Failed: Record Voided</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 text-xs">
                  <p className="font-bold text-rose-950 text-sm">Official Revocation Notice</p>
                  <p className="text-xs leading-relaxed text-rose-900">
                    This academic credential has been formally invalidated on the <strong>TrustCredRegistry</strong> smart contract. Even if original certificate files exist, this record is permanently flagged as void.
                  </p>
                </div>

                {/* On-Chain Record Details */}
                {verificationResult.blockchainRecord && (
                  <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-purple-300 text-sm">Smart Contract Revocation Record</span>
                      <span className="font-mono text-rose-400 font-bold text-xs">revoked = true</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] font-semibold block">Issuing Authority</span>
                        <span className="font-semibold text-slate-200 mt-0.5 block">{verificationResult.blockchainRecord.institution}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] font-semibold block">Credential ID</span>
                        <span className="font-mono font-bold text-indigo-400 mt-0.5 block">{verificationResult.blockchainRecord.credentialId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] font-semibold block">Transaction Hash</span>
                        <span className="font-mono text-purple-300 truncate block mt-0.5" title={verificationResult.blockchainRecord.txHash}>
                          {verificationResult.blockchainRecord.txHash}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] font-semibold block">Block Number</span>
                        <span className="font-mono text-slate-200 block mt-0.5">#{verificationResult.blockchainRecord.blockNumber || 1042}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE 4: ⚪ NOT FOUND / NOT REGISTERED */}
          {/* ========================================================================= */}
          {verificationResult.status === 'NOT_FOUND' && (
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 text-center space-y-5 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wide mb-1 border border-slate-300">
                  ✕ CREDENTIAL NOT FOUND
                </div>
                <h3 className="text-lg font-bold text-slate-900">Credential Not Found</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  The requested credential could not be verified. No record was found on the blockchain or registrar matching the identifier <strong className="font-mono text-indigo-700">{verificationResult.queriedId}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1.5">
                <span className="font-bold text-slate-800 block">Troubleshooting Suggestions:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Verify that the Credential ID format is exact (e.g. TC-2026-89421).</li>
                  <li>Confirm that the issuing university has executed the blockchain registration transaction.</li>
                  <li>Try verifying with one of our sample IDs below.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {samplePresets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleUsePreset(s.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    Try {s.id} ({s.name})
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Certificate Document Modal */}
      <CredentialModal
        credential={selectedCredentialForModal}
        onClose={() => setSelectedCredentialForModal(null)}
        onCredentialUpdated={(updated) => {
          setSelectedCredentialForModal(updated);
          setQueryId(updated.id);
          handleSearch(updated.id);
          onShowToast('Academic Record Modified (Test)', `Simulated tamper on ${updated.id}. Verifier updated.`, 'info');
        }}
      />

      {/* Network Settings Modal */}
      <BlockchainNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* Tamper Modal for Evaluator Testing */}
      <TamperCredentialModal
        credential={tamperTargetCredential}
        isOpen={isTamperModalOpen}
        onClose={() => {
          setIsTamperModalOpen(false);
          setTamperTargetCredential(null);
        }}
        onTamperedApplied={(updated) => {
          onShowToast('Tampered Local Academic Record', `Altered data for ${updated.id}. Try verifying now!`, 'info');
          setQueryId(updated.id);
          handleSearch(updated.id);
        }}
      />
    </div>
  );
};
