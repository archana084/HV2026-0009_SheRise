import React from 'react';
import { ShieldCheck, Building2, GraduationCap, Search, LogOut, User, ArrowRight, BookOpen } from 'lucide-react';
import { CurrentUser } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: CurrentUser;
  onLogout: () => void;
  onSelectRole: (role: 'college' | 'student' | 'verifier') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  onLogout,
  onSelectRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">TrustCred</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Academic Verification System</p>
              </div>
            </button>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                if (currentUser.role === 'college' && currentUser.authenticated) {
                  setCurrentView('college-dashboard');
                } else {
                  setCurrentView('college-login');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView.startsWith('college')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              College Portal
            </button>
            <button
              onClick={() => {
                if (currentUser.role === 'student' && currentUser.authenticated) {
                  setCurrentView('student-dashboard');
                } else {
                  setCurrentView('student-login');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView.startsWith('student')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>
            <button
              onClick={() => setCurrentView('verifier')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'verifier'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Employer / Verify
            </button>
          </nav>

          {/* Right Action / Auth State */}
          <div className="flex items-center gap-3">
            {currentUser.authenticated ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      currentUser.role === 'college' ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  >
                    {currentUser.role === 'college' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left max-w-[140px] truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {currentUser.profile?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('verifier')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Verify ID
                </button>
                <div className="relative group">
                  <button
                    onClick={() => setCurrentView('college-login')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub Navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-3 border-t border-slate-100 bg-slate-50 text-xs">
        <button
          onClick={() => setCurrentView('landing')}
          className={`px-2.5 py-1 rounded font-medium ${currentView === 'landing' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectRole('college')}
          className={`px-2.5 py-1 rounded font-medium ${currentView.startsWith('college') ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          College
        </button>
        <button
          onClick={() => onSelectRole('student')}
          className={`px-2.5 py-1 rounded font-medium ${currentView.startsWith('student') ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}
        >
          Student
        </button>
        <button
          onClick={() => setCurrentView('verifier')}
          className={`px-2.5 py-1 rounded font-medium ${currentView === 'verifier' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
        >
          Verify
        </button>
      </div>
    </header>
  );
};
