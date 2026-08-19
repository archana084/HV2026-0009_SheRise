import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Check, RefreshCw, Hash, Cpu, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { AcademicCredential } from '../types';
import { credentialService } from '../services/credentialService';
import { calculateCredentialHash } from '../utils/hashUtils';

interface TamperCredentialModalProps {
  credential: AcademicCredential | null;
  isOpen: boolean;
  onClose: () => void;
  onTamperedApplied: (updated: AcademicCredential) => void;
}

export const TamperCredentialModal: React.FC<TamperCredentialModalProps> = ({
  credential,
  isOpen,
  onClose,
  onTamperedApplied,
}) => {
  const [studentName, setStudentName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [gradeOrCgpa, setGradeOrCgpa] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [previewHash, setPreviewHash] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (credential) {
      setStudentName(credential.studentName);
      setInstitutionName(credential.institutionName);
      setDegree(credential.degree);
      setBranch(credential.branch);
      setGradeOrCgpa(credential.gradeOrCgpa);
      setGraduationYear(credential.graduationYear);
      setPreviewHash(credential.certificateHash || '');
    }
  }, [credential, isOpen]);

  // Live recalculate preview hash as inputs change
  useEffect(() => {
    if (!credential) return;
    calculateCredentialHash({
      id: credential.id,
      studentName,
      institutionName,
      degree,
      branch,
      graduationYear,
      issueDate: credential.issueDate,
      gradeOrCgpa,
    }).then(res => setPreviewHash(res.certificateHash));
  }, [studentName, institutionName, degree, branch, gradeOrCgpa, graduationYear, credential]);

  if (!isOpen || !credential) return null;

  const handleApplyTamper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await credentialService.updateCredentialAcademicData(credential.id, {
        studentName,
        institutionName,
        degree,
        branch,
        gradeOrCgpa,
        graduationYear: Number(graduationYear),
      });
      onTamperedApplied(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update academic record');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePresetCgpaTamper = () => {
    // If current is e.g. 8.5 or 9.42, set to 9.50 / 10.0 or 9.98
    setGradeOrCgpa('9.50 / 10.0 (Modified CGPA)');
  };

  const handlePresetNameTamper = () => {
    setStudentName(`${studentName} [MODIFIED]`);
  };

  const handlePresetDegreeTamper = () => {
    setDegree('Master of Artificial Intelligence & Robotics');
  };

  const originalHash = credential.certificateHash || 'e7a2b9f36c53d10a48b59ec471fa08d29bca6390145dfbb8180c427fef382901';
  const isHashMismatched = previewHash.toLowerCase() !== originalHash.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wider mb-0.5">
                Data Alteration Simulation
              </div>
              <h2 className="text-sm font-bold text-slate-900">Simulate Academic Record Alteration</h2>
              <span className="text-[11px] font-mono text-slate-500">Target ID: {credential.id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApplyTamper} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Explanatory Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tamper Simulation Mechanism</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              This action modifies only the local registrar record and recalculates its local SHA-256 digest, <strong>leaving the immutable on-chain blockchain record completely unchanged</strong>.
            </p>
            <p className="text-[11px] font-semibold text-amber-900 pt-0.5">
              When an employer verifies this credential, the SHA-256 hash comparison will detect the divergence and display: <code className="bg-amber-100 px-1 rounded text-rose-700 font-bold">INVALID — CERTIFICATE TAMPERED</code>.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-slate-500 font-semibold block text-[11px]">1-Click Quick Modifications:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePresetCgpaTamper}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold transition-colors flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Modify CGPA (e.g. ➔ 9.5)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetNameTamper}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold transition-colors flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Alter Student Name</span>
              </button>
              <button
                type="button"
                onClick={handlePresetDegreeTamper}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold transition-colors flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Alter Degree</span>
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Degree Conferred</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Branch / Major</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Grade / CGPA (Tamper Target)</label>
                <input
                  type="text"
                  required
                  value={gradeOrCgpa}
                  onChange={(e) => setGradeOrCgpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Comparison Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-purple-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Immutable On-Chain Blockchain Hash:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Unchanged</span>
            </div>
            <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-purple-200 break-all select-all border border-slate-800">
              {originalHash}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Modified Data Calculated Hash (SHA-256):
              </span>
              {isHashMismatched ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  MISMATCH DETECTED
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  MATCHING
                </span>
              )}
            </div>
            <div className={`p-2 rounded font-mono text-[10px] break-all select-all border ${
              isHashMismatched
                ? 'bg-rose-950/40 text-rose-200 border-rose-800'
                : 'bg-black/60 text-emerald-200 border-slate-800'
            }`}>
              {previewHash}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Applying Modification...' : 'Save Modified Academic Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
