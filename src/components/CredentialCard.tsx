import React, { useState } from 'react';
import { ShieldCheck, Award, Calendar, Building2, Copy, Check, Eye, ExternalLink, GraduationCap, Hash } from 'lucide-react';
import { AcademicCredential } from '../types';

interface CredentialCardProps {
  credential: AcademicCredential;
  onViewDetails: (credential: AcademicCredential) => void;
  onVerify?: (credentialId: string) => void;
  showStudentInfo?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onViewDetails,
  onVerify,
  showStudentInfo = false,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(credential.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(credential.certificateHash || '');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1800);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Degree Certificate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Official Transcript':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Postgraduate Degree':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Honor Award':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 opacity-80"></div>

      <div>
        {/* Header: Type and Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getBadgeColor(
              credential.credentialType
            )}`}
          >
            <Award className="w-3.5 h-3.5" />
            {credential.credentialType}
          </span>

          {credential.blockchainStatus === 'Revoked' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Revoked On-Chain
            </span>
          ) : credential.blockchainStatus === 'Registered' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              On-Chain Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Not Registered
            </span>
          )}
        </div>

        {/* Degree & Field */}
        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
          {credential.degree}
        </h3>
        <p className="text-xs text-slate-600 font-medium mb-3">
          {credential.branch}
        </p>

        {showStudentInfo && (
          <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <p className="font-semibold text-slate-800">{credential.studentName}</p>
            <p className="text-[11px] text-slate-500 font-mono">ID: {credential.studentId}</p>
          </div>
        )}

        {/* Meta Grid */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{credential.institutionName}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Issued {credential.issueDate}
            </span>
            <span className="font-semibold text-slate-700">Class of {credential.graduationYear}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500">Grade / CGPA:</span>
            <span className="font-bold text-slate-800">{credential.gradeOrCgpa}</span>
          </div>
        </div>

        {/* Credential ID & SHA-256 Certificate Hash Section */}
        <div className="mt-4 space-y-2">
          {/* Credential ID Bar */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Credential ID</span>
              <span className="font-mono text-xs font-semibold text-indigo-700 truncate block">
                {credential.id}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              title="Copy Credential ID"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors shrink-0"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Certificate Hash (SHA-256) */}
          <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="block text-[10px] uppercase font-bold text-indigo-900 tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-600" />
                Certificate Hash (SHA-256)
              </span>
              <span 
                className="font-mono text-[11px] text-slate-700 truncate block hover:text-indigo-900 select-all"
                title={credential.certificateHash}
              >
                {credential.certificateHash 
                  ? `${credential.certificateHash.slice(0, 10)}...${credential.certificateHash.slice(-10)}` 
                  : 'Generating hash...'}
              </span>
            </div>
            <button
              onClick={handleCopyHash}
              title="Copy Full 64-char SHA-256 Hash"
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors shrink-0"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(credential)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Certificate
        </button>

        {onVerify && (
          <button
            onClick={() => onVerify(credential.id)}
            title="Verify in Employer Portal"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
