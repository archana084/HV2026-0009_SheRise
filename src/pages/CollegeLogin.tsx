import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, AlertCircle, Lock, Mail, ChevronDown } from 'lucide-react';
import { authService } from '../services/authService';
import { CurrentUser } from '../types';

interface CollegeLoginProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigate: (view: string) => void;
}

const INSTITUTIONS_LIST = [
  { id: 'inst-01', name: 'JNTUH', code: 'JNTUH-HYD-01' },
  { id: 'inst-02', name: 'Osmania University', code: 'OU-HYD-02' },
  { id: 'inst-03', name: 'AUTONOMOUS', code: 'AUTO-COLL-03' },
  { id: 'inst-04', name: 'SBTET', code: 'SBTET-TS-04' },
];

export const CollegeLogin: React.FC<CollegeLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('inst-01');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.loginAsCollege(selectedInstitutionId, email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Invalid college credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>College Portal Access</span>
          </div>
          <h2 className="text-xl font-bold">Institution / College Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Select your institution and sign in with your registered email address
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Institution Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Institution
              </label>
              <div className="relative">
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 pr-9"
                >
                  {INSTITUTIONS_LIST.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Registered Email Address Input (Blank by default) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email address"
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-500 font-mono">(demo1234)</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => onNavigate('student-login')}
              className="hover:text-indigo-600 transition-colors"
            >
              Are you a student? Sign in here
            </button>
            <button
              type="button"
              onClick={() => onNavigate('verifier')}
              className="hover:text-slate-900 transition-colors"
            >
              Public Verifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
