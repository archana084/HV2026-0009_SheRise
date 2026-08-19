import React, { useState } from 'react';
import { GraduationCap, ArrowRight, AlertCircle, Sparkles, User } from 'lucide-react';
import { authService } from '../services/authService';
import { CurrentUser } from '../types';

interface StudentLoginProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigate: (view: string) => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [studentIdOrEmail, setStudentIdOrEmail] = useState('STU-2022-9102');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authService.loginAsStudent(studentIdOrEmail);
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Student not found');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed');
    }
  };

  const handleQuickSelect = (id: string) => {
    setStudentIdOrEmail(id);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Student Credential Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your verified degrees, transcripts, and academic awards
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fillers */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select a Demo Student Account:</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('STU-2022-9102')}
                className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-emerald-100/60 border border-emerald-200/60 transition-colors text-[11px] text-slate-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Divya Mudavath</span>
                  <span className="text-slate-500 text-[10px] block">STU-2022-9102 (B.Tech AI & Data Science)</span>
                </div>
                <span className="font-mono text-emerald-600 text-[10px] font-bold">Select</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('STU-2022-8419')}
                className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-emerald-100/60 border border-emerald-200/60 transition-colors text-[11px] text-slate-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Aarav Patel</span>
                  <span className="text-slate-500 text-[10px] block">STU-2022-8419 (B.Tech Computer Science)</span>
                </div>
                <span className="font-mono text-emerald-600 text-[10px] font-bold">Select</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('STU-2021-3310')}
                className="text-left px-2.5 py-1.5 rounded bg-white hover:bg-emerald-100/60 border border-emerald-200/60 transition-colors text-[11px] text-slate-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Elena Rostova</span>
                  <span className="text-slate-500 text-[10px] block">STU-2021-3310 (M.S. Software Eng)</span>
                </div>
                <span className="font-mono text-emerald-600 text-[10px] font-bold">Select</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll Number or University Email
              </label>
              <input
                type="text"
                required
                value={studentIdOrEmail}
                onChange={(e) => setStudentIdOrEmail(e.target.value)}
                placeholder="e.g. STU-2022-9102"
                className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{isLoading ? 'Loading Student Vault...' : 'Access My Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => onNavigate('college-login')}
              className="hover:text-indigo-600 transition-colors"
            >
              College / Registrar Login
            </button>
            <button
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
