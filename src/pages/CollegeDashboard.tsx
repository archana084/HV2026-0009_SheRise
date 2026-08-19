import React, { useState, useEffect } from 'react';
import { Building2, Plus, UserPlus, Search, Filter, ShieldCheck, Award, Users, Eye, Copy, Check, ExternalLink, RefreshCw, Calendar, BookOpen, AlertCircle, Cpu, ShieldAlert, Hash, ArrowUpRight, Lock, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AcademicCredential, CurrentUser, InstitutionProfile, StudentProfile, ConnectedWalletInfo } from '../types';
import { credentialService } from '../services/credentialService';
import { blockchainService, PRESET_WALLETS } from '../services/blockchainService';
import { CreateCredentialModal } from '../components/CreateCredentialModal';
import { AddStudentModal } from '../components/AddStudentModal';
import { CredentialModal } from '../components/CredentialModal';
import { BlockchainNetworkModal } from '../components/BlockchainNetworkModal';
import { RevokeCredentialModal } from '../components/RevokeCredentialModal';
import { TamperCredentialModal } from '../components/TamperCredentialModal';

interface CollegeDashboardProps {
  currentUser: CurrentUser;
  onNavigateToVerifier: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: string) => void;
}

export const CollegeDashboard: React.FC<CollegeDashboardProps> = ({
  currentUser,
  onNavigateToVerifier,
  onShowToast,
  onNavigate,
}) => {
  // 🔒 RBAC ENFORCEMENT: Only COLLEGE, FACULTY, or ADMIN can access College Portal
  const isAuthorizedRole = currentUser.authenticated && (
    currentUser.role === 'college' || 
    currentUser.role === 'faculty' || 
    currentUser.role === 'admin'
  );

  if (!isAuthorizedRole) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Access Denied • Role Restriction (403)
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Institutional Access Required</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              You are currently authenticated as a <strong className="text-slate-900 font-semibold">{currentUser.role.toUpperCase()}</strong> ({currentUser.profile?.name || 'Student Account'}). 
              Only authorized institutional registrars and college authorities are permitted to access this portal or issue academic credentials.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Role:</span>
              <span className="font-bold text-rose-600">{currentUser.role.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Required Role:</span>
              <span className="font-bold text-indigo-600">COLLEGE / FACULTY / ADMIN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Smart Contract Check:</span>
              <span className="font-bold text-emerald-600">TrustCredRegistry.onlyAuthorizedIssuer</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser.role === 'student' && onNavigate && (
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Return to Student Portal
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('college-login')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition-colors"
              >
                Sign In as College Registrar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const institution = currentUser.profile as InstitutionProfile | undefined;
  const institutionName = institution?.name || 'JNTUH';

  const [activeTab, setActiveTab] = useState<'credentials' | 'students'>('credentials');
  const [credentials, setCredentials] = useState<AcademicCredential[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Active connected wallet state
  const [walletInfo, setWalletInfo] = useState<ConnectedWalletInfo | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [credentialToRevoke, setCredentialToRevoke] = useState<AcademicCredential | null>(null);
  const [credentialToTamper, setCredentialToTamper] = useState<AcademicCredential | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<AcademicCredential | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // Load data & wallet info
  const loadData = async () => {
    try {
      setLoading(true);
      const [creds, stus, wInfo] = await Promise.all([
        credentialService.getCredentials(institutionName),
        credentialService.getStudents(institutionName),
        blockchainService.getWalletInfo(),
      ]);
      setCredentials(creds);
      setStudents(stus);
      setWalletInfo(wInfo);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to load dashboard data', 'Please check connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institutionName]);

  const handleCreateCredential = async (data: any) => {
    try {
      const created = await credentialService.createCredential(data);
      await loadData();
      onShowToast('Credential Issued Successfully', `Generated ID: ${created.id} for ${created.studentName}`, 'success');
    } catch (err: any) {
      console.error('Credential issuance failed:', err);
      onShowToast('Issuance Blocked on Blockchain', err?.message || 'Unauthorized wallet', 'error');
      throw err;
    }
  };

  const handleAddStudent = async (data: any) => {
    const created = await credentialService.addStudent(data);
    await loadData();
    onShowToast('Student Registered', `${created.name} (${created.studentId}) registered to institution`, 'success');
  };

  const handleRegisterOnBlockchain = async (cred: AcademicCredential, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setRegisteringId(cred.id);
      const updated = await credentialService.registerCredentialOnBlockchain(cred.id);
      await loadData();
      onShowToast(
        'Registered on Blockchain',
        `Credential ${updated.id} anchored to smart contract (Tx: ${updated.txHash?.slice(0, 10)}...)`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Blockchain Registration Failed', err?.message || 'Transaction reverted', 'error');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleOpenRevokeModal = (cred: AcademicCredential, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCredentialToRevoke(cred);
    setIsRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async (credentialId: string) => {
    const updated = await credentialService.revokeCredentialOnBlockchain(credentialId);
    await loadData();
    onShowToast(
      'Credential Revoked on Blockchain',
      `On-chain record for ${updated.id} permanently set to revoked = true`,
      'info'
    );
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    onShowToast('Copied ID', id, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    onShowToast('Copied SHA-256 Hash', '64-character hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all records and blockchain state back to defaults?')) {
      await credentialService.resetDemoData();
      await loadData();
      onShowToast('Reset Complete', 'Academic records & blockchain registry restored to defaults', 'info');
    }
  };

  // Filtered credentials
  const filteredCredentials = credentials.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || c.credentialType === filterType;
    return matchesSearch && matchesType;
  });

  // Filtered students
  const filteredStudents = students.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const registeredCount = credentials.filter(c => c.blockchainStatus === 'Registered').length;
  const revokedCount = credentials.filter(c => c.blockchainStatus === 'Revoked').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Institution Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{institutionName}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {institution?.institutionCode || 'JNTUH-HYD-01'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{institution?.location || 'Hyderabad, Telangana'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">{institution?.accreditation || 'NAAC A+ Grade'}</span>
                <span>•</span>
                <span>Registrar: {institution?.email || 'registrar@jntuh.ac.in'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons & Network Setting */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsNetworkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-xs transition-colors"
              title="Configure Blockchain Network and Smart Contract"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>Smart Contract Config</span>
            </button>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Academic Credential</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Total Issued</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{credentials.length}</span>
            <span className="text-[11px] text-indigo-600 font-medium">Deterministic SHA-256 Hashed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-semibold uppercase text-emerald-800 block">On-Chain Registered</span>
            <span className="text-2xl font-bold text-emerald-950 mt-1 block">{registeredCount}</span>
            <span className="text-[11px] text-emerald-700 font-medium">Anchored to TrustCredRegistry</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[11px] font-semibold uppercase text-rose-800 block">On-Chain Revoked</span>
            <span className="text-2xl font-bold text-rose-950 mt-1 block">{revokedCount}</span>
            <span className="text-[11px] text-rose-700 font-medium">Marked revoked on-chain</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[11px] font-semibold uppercase text-purple-800 block">Smart Contract</span>
            <span className="text-sm font-mono font-bold text-purple-950 mt-1 block truncate">TrustCredRegistry</span>
            <span className="text-[10px] text-purple-700">Solidity EVM Layer</span>
          </div>
        </div>
      </div>

      {/* 🔒 Blockchain Authorization Layer & Institutional Identity */}
      <div className="rounded-2xl border p-4 sm:p-5 transition-all shadow-xs bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 border-emerald-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-emerald-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                  Authorized Institutional Issuer Wallet
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified on TrustCredRegistry.sol
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{institution?.name || 'JNTUH'}</span>
                <span className="text-slate-400">|</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700">
                  {institution?.walletAddress || walletInfo?.address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>On-Chain Modifier: <strong className="font-mono text-slate-800">onlyAuthorizedIssuer</strong></span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Cryptographic Authorization Active:</span> Credentials created from this dashboard are signed and anchored to <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">TrustCredRegistry.sol</code> from this approved institution's on-chain address.
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'credentials'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Issued Credentials ({credentials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Students ({students.length})</span>
            </button>
          </div>

          <button
            onClick={handleResetData}
            title="Reset to default mock records"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo & Blockchain Data</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'credentials' ? 'Search by name, student ID, credential ID...' : 'Search students by name, roll no, branch...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {activeTab === 'credentials' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Credential Types</option>
                <option value="Degree Certificate">Degree Certificates</option>
                <option value="Official Transcript">Official Transcripts</option>
                <option value="Postgraduate Degree">Postgraduate Degrees</option>
                <option value="Diploma">Diplomas</option>
                <option value="Honor Award">Honor Awards</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Issued Credentials View */}
        {activeTab === 'credentials' && (
          <div className="overflow-x-auto">
            {filteredCredentials.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Credentials Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No issued credentials matched your search query. Try clearing filters.'
                    : 'No credentials issued yet. Click "Issue Academic Credential" above to issue your first verified record.'}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue New Credential</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-6">Credential ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Type & Degree</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                    <th className="py-3 px-4">Blockchain Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCredentials.map((cred) => (
                    <tr
                      key={cred.id}
                      onClick={() => setSelectedCredential(cred)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700">{cred.id}</span>
                          <button
                            onClick={(e) => handleCopyId(cred.id, e)}
                            title="Copy Credential ID"
                            className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors"
                          >
                            {copiedId === cred.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Issued {cred.issueDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{cred.studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{cred.studentId}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 mb-1">
                          {cred.credentialType}
                        </span>
                        <p className="text-xs font-medium text-slate-800 line-clamp-1">{cred.degree}</p>
                        <p className="text-[11px] text-slate-500">{cred.branch}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-all"
                            title={cred.certificateHash}
                          >
                            {cred.certificateHash ? `${cred.certificateHash.slice(0, 8)}...${cred.certificateHash.slice(-6)}` : 'N/A'}
                          </span>
                          <button
                            onClick={(e) => handleCopyHash(cred.certificateHash || '', e)}
                            title="Copy SHA-256 Hash"
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                          >
                            {copiedHash === cred.certificateHash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {cred.blockchainStatus === 'Registered' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Registered
                            </span>
                            {cred.txHash && (
                              <span 
                                className="block font-mono text-[10px] text-slate-500 truncate max-w-[120px]"
                                title={cred.txHash}
                              >
                                Tx: {cred.txHash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        ) : cred.blockchainStatus === 'Revoked' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Revoked
                            </span>
                            <span className="block text-[10px] text-rose-600 font-medium">On-Chain Flag</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Not Registered
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Blockchain Register Button if not registered */}
                          {(!cred.blockchainStatus || cred.blockchainStatus === 'Not Registered') && (
                            <button
                              onClick={(e) => handleRegisterOnBlockchain(cred, e)}
                              disabled={registeringId === cred.id}
                              title="Register on Blockchain Smart Contract"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                            >
                              <Cpu className="w-3 h-3" />
                              <span>{registeringId === cred.id ? 'Registering...' : 'Register'}</span>
                            </button>
                          )}

                          {/* Revoke button if Registered */}
                          {cred.blockchainStatus === 'Registered' && (
                            <button
                              onClick={(e) => handleOpenRevokeModal(cred, e)}
                              title="Revoke Credential on Blockchain"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          )}

                          {/* Tamper simulation button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCredentialToTamper(cred);
                              setIsTamperModalOpen(true);
                            }}
                            title="Simulate Academic Data Tamper"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Simulate Tamper</span>
                          </button>

                          <button
                            onClick={() => setSelectedCredential(cred)}
                            title="View Certificate"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigateToVerifier(cred.id)}
                            title="Verify in Employer Portal"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Registered Students View */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Students Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No registered students matched your search query.'
                    : 'No student profiles registered yet. Click "Add Student" above to create records.'}
                </p>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register First Student</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-6">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Program & Branch</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Graduation</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((stu) => {
                    const studentCredCount = credentials.filter((c) => c.studentId === stu.studentId).length;
                    return (
                      <tr key={stu.id || stu.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-700">
                          {stu.studentId}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{stu.name}</p>
                          <p className="text-[11px] text-slate-500">{stu.cgpa ? `CGPA: ${stu.cgpa}` : 'Enrolled'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800">{stu.degree}</p>
                          <p className="text-[11px] text-slate-500">{stu.branch}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {stu.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">
                          Class of {stu.graduationYear}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              studentCredCount > 0
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {studentCredCount} {studentCredCount === 1 ? 'Credential' : 'Credentials'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Create Credential Modal */}
      <CreateCredentialModal
        institutionName={institutionName}
        students={students}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCredential}
        onWalletChanged={loadData}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        institutionName={institutionName}
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleAddStudent}
      />

      {/* View Certificate Document Modal */}
      <CredentialModal
        credential={selectedCredential}
        onClose={() => setSelectedCredential(null)}
        onNavigateToVerifier={onNavigateToVerifier}
        onCredentialUpdated={(updated) => {
          setSelectedCredential(updated);
          loadData();
          onShowToast('Academic Record Modified (Test)', `Altered data for ${updated.id}. Blockchain hash unchanged.`, 'info');
        }}
      />

      {/* Blockchain Network Settings Modal */}
      <BlockchainNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onConfigChanged={loadData}
      />

      {/* Revoke Credential Confirmation Modal */}
      <RevokeCredentialModal
        credential={credentialToRevoke}
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setCredentialToRevoke(null);
        }}
        onConfirmRevoke={handleConfirmRevoke}
      />

      {/* Tamper Credential Test Modal */}
      <TamperCredentialModal
        credential={credentialToTamper}
        isOpen={isTamperModalOpen}
        onClose={() => {
          setIsTamperModalOpen(false);
          setCredentialToTamper(null);
        }}
        onTamperedApplied={(updated) => {
          loadData();
          onShowToast('Academic Record Modified', `Modified ${updated.id}. On-chain hash is unchanged.`, 'info');
        }}
      />
    </div>
  );
};
