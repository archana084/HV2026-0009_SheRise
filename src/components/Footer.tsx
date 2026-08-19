import React from 'react';
import { ShieldCheck, CheckCircle2, CircleDashed } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>TrustCred</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trusted Digital Credentials. Instant Verification. A verifiable academic credential ecosystem for institutions, students, and global employers.
            </p>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">User Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('college-login')}
                  className="hover:text-white transition-colors"
                >
                  Institution / College Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('student-login')}
                  className="hover:text-white transition-colors"
                >
                  Student Digital Credential Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('verifier')}
                  className="hover:text-white transition-colors"
                >
                  Employer / Public Verification Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon Roadmap Overview */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Project Architecture & Phased Roadmap
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/80 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phase 1 (Completed)</span>
                </div>
                <p className="text-[11px] text-slate-400">Frontend Foundation, Multi-Role Dashboards & Credential Lifecycle</p>
              </div>

              <div className="p-2.5 rounded bg-slate-800/80 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phase 2 (Completed)</span>
                </div>
                <p className="text-[11px] text-slate-400">SHA-256 Hashing & Blockchain Smart Contract Registration</p>
              </div>

              <div className="p-2.5 rounded bg-slate-800/80 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phase 3 (Completed)</span>
                </div>
                <p className="text-[11px] text-slate-400">Dynamic URL Verification, Tamper Detection & Credential Revocation</p>
              </div>

              <div className="p-2.5 rounded bg-slate-800/80 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phase 4 (Implemented)</span>
                </div>
                <p className="text-[11px] text-slate-400">QR-Based Digital Credential Sharing & Employer Verification</p>
              </div>

              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-0.5">
                  <CircleDashed className="w-3.5 h-3.5" />
                  <span>Phase 5 (Upcoming)</span>
                </div>
                <p className="text-[11px] text-slate-500">AI-Powered Certificate Intelligence & Automated Processing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TrustCred Project. Built for Hackathon Prototype Demonstration.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Modular Service Layer</span>
            <span>•</span>
            <span>Zero Fake Blockchain Claims</span>
            <span>•</span>
            <span>Production-Ready UI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
