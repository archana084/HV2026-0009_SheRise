import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/NotificationToast';
import { LandingPage } from './pages/LandingPage';
import { CollegeLogin } from './pages/CollegeLogin';
import { StudentLogin } from './pages/StudentLogin';
import { CollegeDashboard } from './pages/CollegeDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { VerifierPage } from './pages/VerifierPage';
import { authService } from './services/authService';
import { CurrentUser, StudentProfile } from './types';

function parseVerificationRoute(): { isVerifyRoute: boolean; credentialId: string } {
  if (typeof window === 'undefined') {
    return { isVerifyRoute: false, credentialId: '' };
  }

  try {
    const { pathname, search, hash, href } = window.location;

    // 1. Check query string with case-insensitivity: ?credentialId=TC-XXXX, ?credential_id=, ?verify=, ?id=
    const searchParams = new URLSearchParams(search);
    for (const [key, value] of searchParams.entries()) {
      const k = key.toLowerCase();
      if ((k === 'credentialid' || k === 'credential_id' || k === 'verify' || k === 'id') && value.trim()) {
        return { isVerifyRoute: true, credentialId: decodeURIComponent(value).trim().toUpperCase() };
      }
    }

    // 2. Check regex in entire search or href string for credentialId= or verify=
    const queryMatch = (search + hash + href).match(/[?&#](?:credentialId|credential_id|verify|id)=([a-zA-Z0-9_-]+)/i);
    if (queryMatch && queryMatch[1]) {
      return { isVerifyRoute: true, credentialId: decodeURIComponent(queryMatch[1]).trim().toUpperCase() };
    }

    // 3. Check pathname: /verify/:id or /verify or subpaths
    const pathMatch = pathname.match(/\/verify(?:\/([a-zA-Z0-9_-]+))?/i);
    if (pathMatch) {
      const idFromPath = pathMatch[1] ? decodeURIComponent(pathMatch[1]).trim().toUpperCase() : '';
      return { isVerifyRoute: true, credentialId: idFromPath };
    }

    // 4. Check hash: #/verify/TC-XXXX or #verify=TC-XXXX or #credentialId=...
    if (hash) {
      const hashMatch = hash.match(/(?:verify|credentialId)(?:[=/]|\/)([a-zA-Z0-9_-]+)/i);
      if (hashMatch && hashMatch[1]) {
        return { isVerifyRoute: true, credentialId: decodeURIComponent(hashMatch[1]).trim().toUpperCase() };
      }
      if (hash.toLowerCase().includes('verify')) {
        return { isVerifyRoute: true, credentialId: '' };
      }
    }
  } catch (err) {
    console.error('Error parsing route from location:', err);
  }

  return { isVerifyRoute: false, credentialId: '' };
}

export default function App() {
  const initialRoute = parseVerificationRoute();
  const [currentView, setCurrentView] = useState<string>(initialRoute.isVerifyRoute ? 'verifier' : 'landing');
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    role: 'guest',
    authenticated: false,
  });
  const [verifierTargetId, setVerifierTargetId] = useState<string>(initialRoute.credentialId);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize session and sync verify route on mount and URL popstate / hashchange
  useEffect(() => {
    const session = authService.getCurrentSession();
    setCurrentUser(session);

    const syncRouteFromLocation = () => {
      const route = parseVerificationRoute();
      if (route.isVerifyRoute) {
        setCurrentView('verifier');
        if (route.credentialId) {
          setVerifierTargetId(route.credentialId);
        }
      }
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser({
      role: 'guest',
      authenticated: false,
    });
    setCurrentView('landing');
    addToast('Signed Out', 'You have been signed out successfully', 'info');
  };

  const handleRoleSelect = (role: 'college' | 'student' | 'verifier') => {
    if (role === 'college') {
      if (currentUser.role === 'college' && currentUser.authenticated) {
        setCurrentView('college-dashboard');
      } else {
        setCurrentView('college-login');
      }
    } else if (role === 'student') {
      if (currentUser.role === 'student' && currentUser.authenticated) {
        setCurrentView('student-dashboard');
      } else {
        setCurrentView('student-login');
      }
    } else if (role === 'verifier') {
      setCurrentView('verifier');
    }
  };

  const handleNavigateToVerifier = (credentialId: string) => {
    setVerifierTargetId(credentialId);
    setCurrentView('verifier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchStudent = (newStudent: StudentProfile) => {
    const updatedUser: CurrentUser = {
      role: 'student',
      profile: newStudent,
      authenticated: true,
    };
    authService.setSession(updatedUser);
    setCurrentUser(updatedUser);
    addToast('Switched Student Account', `Now viewing ${newStudent.name}'s vault`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectRole={handleRoleSelect}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onVerifySampleId={handleNavigateToVerifier}
          />
        )}

        {currentView === 'college-login' && (
          <CollegeLogin
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('college-dashboard');
              addToast('Welcome Back', `Signed in as ${user.profile?.name}`, 'success');
            }}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'student-login' && (
          <StudentLogin
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('student-dashboard');
              addToast('Welcome', `Signed in as ${user.profile?.name}`, 'success');
            }}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'college-dashboard' && (
          authService.isCollegeUser(currentUser) ? (
            <CollegeDashboard
              currentUser={currentUser}
              onNavigateToVerifier={handleNavigateToVerifier}
              onShowToast={addToast}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <CollegeLogin
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setCurrentView('college-dashboard');
                addToast('Welcome Back', `Signed in as ${user.profile?.name}`, 'success');
              }}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {currentView === 'student-dashboard' && (
          <StudentDashboard
            currentUser={currentUser}
            onNavigateToVerifier={handleNavigateToVerifier}
            onShowToast={addToast}
            onSwitchStudent={handleSwitchStudent}
          />
        )}

        {currentView === 'verifier' && (
          <VerifierPage
            initialCredentialId={verifierTargetId}
            onShowToast={addToast}
          />
        )}
      </main>

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Bottom Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
