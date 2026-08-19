import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { AcademicCredential } from '../types';

interface RevokeCredentialModalProps {
  credential: AcademicCredential | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRevoke: (credentialId: string) => Promise<void>;
}

export const RevokeCredentialModal: React.FC<RevokeCredentialModalProps> = ({
  credential,
  isOpen,
  onClose,
  onConfirmRevoke,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('Administrative error / Replacement issued');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !credential) return null;

  const handleRevoke = async () => {
    if (confirmText.trim().toUpperCase() !== 'REVOKE') {
      setError('Please type "REVOKE" to confirm on-chain revocation.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmRevoke(credential.id);
      setIsSubmitting(false);
      setConfirmText('');
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to revoke credential on blockchain.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Warning Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-rose-950 text-base">Revoke On-Chain Credential</h2>
              <p className="text-xs text-rose-700">Irreversible Blockchain Registry Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Smart Contract Revocation Effect</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Executing this will call <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">revokeCredential("{credential.id}")</code> on the <strong>TrustCredRegistry</strong> smart contract. 
              The on-chain status will permanently change to <strong className="text-rose-700">revoked = true</strong>. Anyone verifying this credential will receive an official revocation alert.
            </p>
          </div>

          {/* Credential Target Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Credential ID:</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{credential.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-900">{credential.studentName} ({credential.studentId})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Degree:</span>
              <span className="font-medium text-slate-800">{credential.degree}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-bold text-emerald-700">{credential.blockchainStatus || 'Registered'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Revocation Reason / Administrative Notes
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Administrative error / Replacement issued">Administrative error / Replacement issued</option>
              <option value="Academic misconduct / Honor code violation">Academic misconduct / Honor code violation</option>
              <option value="Disciplinary board decision">Disciplinary board decision</option>
              <option value="Award rescinded by Board of Regents">Award rescinded by Board of Regents</option>
              <option value="Testing & demonstration purpose">Testing & demonstration purpose</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type <span className="font-mono font-bold text-rose-600">REVOKE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REVOKE"
              className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmText.trim().toUpperCase() !== 'REVOKE' || isSubmitting}
            onClick={handleRevoke}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isSubmitting ? 'Revoking On-Chain...' : 'Execute On-Chain Revocation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
