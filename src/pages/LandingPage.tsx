import React from 'react';
import { ShieldCheck, Building2, GraduationCap, Search, ArrowRight, CheckCircle2, Award, Lock, Sparkles, Layers, FileCheck, Users, Copy, Check } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onVerifySampleId: (sampleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onVerifySampleId }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const sampleIds = [
    { id: 'TC-2026-89421', name: 'Divya Mudavath', type: 'B.Tech AI & Data Science' },
    { id: 'TC-2026-77319', name: 'Aarav Patel', type: 'B.Tech Computer Science' },
    { id: 'TC-2025-41092', name: 'Elena Rostova', type: 'M.S. Software Engineering' },
  ];

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Main Headline & Subtitle */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Trusted Digital Credentials. <br />
              <span className="text-indigo-600">Blockchain-Verified.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              TrustCred connects university credential issuance with deterministic SHA-256 cryptographic hashing and the <strong className="text-purple-700 font-mono">TrustCredRegistry</strong> Solidity smart contract to eliminate certificate forgery and enable instant on-chain verification.
            </p>

            {/* Notice regarding blockchain integration */}
            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 text-left sm:text-center max-w-xl mx-auto">
              <span className="font-bold">Blockchain Architecture:</span> Features Solidity Smart Contract (<code className="font-mono bg-white px-1 py-0.5 rounded text-purple-800 font-semibold">TrustCredRegistry.sol</code>), browser-native Web Crypto SHA-256 digests, on-chain registration, and smart-contract level revocation with full employer verification.
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => onNavigate('college-login')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>College Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('student-login')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Student Login</span>
              </button>

              <button
                onClick={() => onNavigate('verifier')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-xs transition-all"
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Employer / Verify</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Built for the Complete Academic Ecosystem
          </h2>
          <p className="text-sm text-slate-600">
            A unified interface connecting universities, graduating students, and recruiting organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: College */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Secure Credential Issuance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Colleges and universities issue tamper-evident digital certificates, official transcripts, diplomas, and awards with unique standardized Credential IDs.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Student roster and class management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-type academic credential generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audit trail of all issued certificates</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onNavigate('college-login')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <span>Enter College Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Student */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Student Credential Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students access their lifetime digital portfolio of degrees, certificates, and grades in a clean, shareable digital credential vault.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive high-resolution certificate views</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>One-click Credential ID sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant verification link generator</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onNavigate('student-login')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Employer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Fast Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters, background-check agencies, and universities can verify claims in seconds by entering a Credential ID without cumbersome paperwork.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant Credential ID search & record validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Transparent status checks (Active/Revoked)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero fake claims / verified institutional data</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onNavigate('verifier')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <span>Open Verification Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Test Demo Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono">
              <span>Sample Credential IDs</span>
            </div>
            <h3 className="text-xl font-bold">Try Sample Credentials in the Verification Engine</h3>
            <p className="text-xs text-slate-400">
              Click any of the pre-loaded academic credentials below to jump straight to the employer verification tool:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {sampleIds.map((sample) => (
                <div
                  key={sample.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400">{sample.id}</span>
                      <button
                        onClick={() => handleCopy(sample.id)}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                        title="Copy ID"
                      >
                        {copiedId === sample.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1">{sample.name}</p>
                    <p className="text-[11px] text-slate-400">{sample.type}</p>
                  </div>

                  <button
                    onClick={() => onVerifySampleId(sample.id)}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    <span>Verify ID</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
