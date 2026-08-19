import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ShieldCheck, Award, ExternalLink, Calendar, Building2, User, BookOpen, GraduationCap, CheckCircle2, Printer, Hash, Terminal, RefreshCw, Cpu, ShieldAlert, Layers, AlertTriangle, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AcademicCredential } from '../types';
import { calculateCredentialHash } from '../utils/hashUtils';
import { TamperCredentialModal } from './TamperCredentialModal';

interface CredentialModalProps {
  credential: AcademicCredential | null;
  onClose: () => void;
  onNavigateToVerifier?: (credentialId: string) => void;
  onRegisterOnBlockchain?: (credentialId: string) => Promise<void>;
  onCredentialUpdated?: (updated: AcademicCredential) => void;
}

export function getCredentialVerificationUrl(credentialId: string): string {
  const cleanId = (credentialId || '').trim();
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/verify/${cleanId}`;
  }
  return `/verify/${cleanId}`;
}

export const CredentialModal: React.FC<CredentialModalProps> = ({
  credential,
  onClose,
  onNavigateToVerifier,
  onRegisterOnBlockchain,
  onCredentialUpdated,
}) => {
  const [activeCred, setActiveCred] = useState<AcademicCredential | null>(credential);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [showCryptoInspector, setShowCryptoInspector] = useState(false);
  const [liveCalculatedHash, setLiveCalculatedHash] = useState<string | null>(null);
  const [liveCanonicalString, setLiveCanonicalString] = useState<string | null>(null);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setActiveCred(credential);
  }, [credential]);

  if (!activeCred) return null;

  const publicVerificationUrl = getCredentialVerificationUrl(activeCred.id);

  const handleCopyQrUrl = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(publicVerificationUrl);
    setCopiedQrUrl(true);
    setTimeout(() => setCopiedQrUrl(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeCred.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activeCred.certificateHash || '');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyTx = () => {
    navigator.clipboard.writeText(activeCred.txHash || '');
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecomputeHash = async () => {
    setIsRecomputing(true);
    try {
      const result = await calculateCredentialHash({
        id: activeCred.id,
        studentName: activeCred.studentName,
        institutionName: activeCred.institutionName,
        degree: activeCred.degree,
        branch: activeCred.branch,
        graduationYear: activeCred.graduationYear,
        issueDate: activeCred.issueDate,
        gradeOrCgpa: activeCred.gradeOrCgpa,
      });
      setLiveCanonicalString(result.canonicalString);
      setLiveCalculatedHash(result.certificateHash);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleRegister = async () => {
    if (!onRegisterOnBlockchain) return;
    try {
      setIsRegistering(true);
      await onRegisterOnBlockchain(activeCred.id);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTamperApplied = (updated: AcademicCredential) => {
    setActiveCred(updated);
    if (onCredentialUpdated) {
      onCredentialUpdated(updated);
    }
  };

  const isRevoked = activeCred.blockchainStatus === 'Revoked';
  const isRegistered = activeCred.blockchainStatus === 'Registered';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
          {/* Modal Top Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex flex-wrap items-center gap-2">
              {isRevoked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  REVOKED on Blockchain
                </span>
              ) : isRegistered ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Registered on Blockchain
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Not Registered On-Chain
                </span>
              )}
              <span className="text-xs text-slate-500 font-mono">ID: {activeCred.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTamperModalOpen(true)}
                title="Simulate Tampering (Testing Only)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">🧪 Simulate Tampering</span>
                <span className="sm:hidden">Tamper</span>
              </button>
              <button
                onClick={handlePrint}
                title="Print Document"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Display Area */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
            {/* Dev / Testing Tamper Simulation Bar */}
            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-950">Academic Data Integrity Control</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                    Modify Student Name, Institution, Degree, Branch, or CGPA (e.g. 8.5 ➔ 9.5) locally without altering the on-chain blockchain record.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTamperModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shrink-0 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Edit Academic Record</span>
              </button>
            </div>

            {/* If Revoked Banner */}
            {isRevoked && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-rose-950">OFFICIALLY REVOKED ON BLOCKCHAIN</p>
                  <p className="text-[11px] text-rose-800">
                    This academic credential has been formally marked as revoked on the <strong>TrustCredRegistry</strong> smart contract.
                  </p>
                </div>
              </div>
            )}

            {/* Certificate Styling Container */}
            <div className="border-2 border-indigo-900/20 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 p-6 sm:p-8 rounded-xl relative shadow-inner text-center">
              {/* Watermark badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <ShieldCheck className="w-72 h-72 text-indigo-950" />
              </div>

              {/* Header / Seal */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-700 text-white flex items-center justify-center shadow-md mb-2">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
                  {activeCred.institutionName}
                </h2>
                <p className="text-xs uppercase tracking-widest text-indigo-800 font-semibold mt-1">
                  Official Academic Credential
                </p>
                <div className="w-24 h-0.5 bg-indigo-600/40 mt-3"></div>
              </div>

              {/* Declaration Text */}
              <div className="space-y-4 my-6">
                <p className="text-xs text-slate-500 italic">This is to certify that</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  {activeCred.studentName}
                </h3>
                <p className="text-xs font-mono text-slate-600">Student ID: {activeCred.studentId}</p>
                
                <p className="text-xs text-slate-500 italic mt-3">has successfully fulfilled the requirements for the</p>
                <p className="text-lg sm:text-xl font-bold text-indigo-950">
                  {activeCred.degree}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Specialization in {activeCred.branch}
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-4 py-3 border-y border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Academic Performance</span>
                    <span className="font-bold text-slate-900">{activeCred.gradeOrCgpa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Class of</span>
                    <span className="font-bold text-slate-900">{activeCred.graduationYear}</span>
                  </div>
                </div>

                {activeCred.remarks && (
                  <p className="text-xs text-slate-600 max-w-md mx-auto italic bg-white/70 p-2.5 rounded border border-slate-200/60">
                    "{activeCred.remarks}"
                  </p>
                )}
              </div>

              {/* Bottom Meta & On-Chain Verification QR Code */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4 border-t border-slate-200">
                <div className="text-left space-y-1.5">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold">Date of Issuance</span>
                    <span className="font-medium text-slate-800">{activeCred.issueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRevoked ? 'Record Revoked' : 'Verified Academic Record'}</span>
                  </div>
                </div>

                {/* Instant Public Verification QR Code */}
                <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                    <QRCodeSVG
                      value={publicVerificationUrl}
                      size={76}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-left pr-1 space-y-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight block">
                      SCAN TO VERIFY
                    </span>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold block">
                      Credential ID: {activeCred.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyQrUrl}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 transition-colors border border-indigo-200"
                    >
                      {copiedQrUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-indigo-600" />}
                      <span>{copiedQrUrl ? 'URL Copied' : 'Copy Verification URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain & Cryptographic Record Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-purple-300 block">Blockchain Verification Record</span>
                    <span className="text-[10px] text-slate-400 font-mono">Contract: TrustCredRegistry.sol</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                  isRevoked 
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : isRegistered 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {activeCred.blockchainStatus || 'Not Registered'}
                </span>
              </div>

              {/* SHA-256 Hash Digest */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    SHA-256 Certificate Hash (Web Crypto API):
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-indigo-400 hover:text-indigo-200 inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded font-mono text-[11px] text-indigo-200 break-all select-all border border-slate-800">
                  {activeCred.certificateHash || 'Calculating SHA-256 hash...'}
                </div>
              </div>

              {/* Transaction Hash & Block Info */}
              {activeCred.txHash && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Transaction Hash</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] text-purple-300 truncate max-w-[170px]" title={activeCred.txHash}>
                        {activeCred.txHash}
                      </span>
                      <button onClick={handleCopyTx} className="text-slate-400 hover:text-purple-300">
                        {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Block Number</span>
                    <span className="font-mono text-[11px] text-slate-200 block mt-0.5">
                      #{activeCred.blockNumber || 1042}
                    </span>
                  </div>
                </div>
              )}

              {/* Cryptographic Inspector Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!showCryptoInspector) handleRecomputeHash();
                    setShowCryptoInspector(!showCryptoInspector);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{showCryptoInspector ? 'Hide Canonical Payload' : 'View Canonical Hash Construction'}</span>
                </button>

                {showCryptoInspector && (
                  <div className="mt-3 p-3 bg-black/80 rounded-lg space-y-2 font-mono text-[11px] text-slate-300 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Ordered Canonical Payload:</span>
                    <p className="p-2 bg-slate-950 rounded text-amber-200/90 break-all select-all border border-slate-800 text-[10px]">
                      {activeCred.canonicalString || liveCanonicalString}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Structured Attributes Breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Academic Registry Metadata
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Credential ID
                  </span>
                  <span className="font-mono font-bold text-indigo-700">{activeCred.id}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Type
                  </span>
                  <span className="font-medium text-slate-800">{activeCred.credentialType}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Issuing Body
                  </span>
                  <span className="font-medium text-slate-800 truncate max-w-[160px]">{activeCred.institutionName}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Record Created
                  </span>
                  <span className="font-medium text-slate-800">{new Date(activeCred.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTamperModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulate Data Alteration</span>
              </button>

              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied ID</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied Hash</span>
                  </>
                ) : (
                  <>
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToVerifier && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToVerifier(activeCred.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify in Employer Portal</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tamper Simulation Modal */}
      <TamperCredentialModal
        credential={activeCred}
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
        onTamperedApplied={handleTamperApplied}
      />
    </>
  );
};
