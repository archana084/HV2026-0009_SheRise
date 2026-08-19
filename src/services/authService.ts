import { CurrentUser, InstitutionProfile, StudentProfile, UserRole } from '../types';
import { credentialService } from './credentialService';
import { blockchainService } from './blockchainService';

const AUTH_STORAGE_KEY = 'trustcred_auth_session_v1';

export const authService = {
  getCurrentSession(): CurrentUser {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    }
    return {
      role: 'guest',
      authenticated: false,
    };
  },

  setSession(user: CurrentUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  getToken(): string | null {
    const session = this.getCurrentSession();
    return session.token || null;
  },

  // Role verification helper
  hasRole(user: CurrentUser, allowedRoles: UserRole[]): boolean {
    return user.authenticated && allowedRoles.includes(user.role);
  },

  isCollegeUser(user: CurrentUser): boolean {
    return user.authenticated && (user.role === 'college' || user.role === 'faculty' || user.role === 'admin');
  },

  isStudentUser(user: CurrentUser): boolean {
    return user.authenticated && user.role === 'student';
  },

  // College Institution + Email + Password Authentication
  async loginAsCollege(
    institutionId: string,
    email: string,
    password?: string
  ): Promise<{
    success: boolean;
    user?: CurrentUser;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/auth/college/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId,
          email,
          password: password || 'demo1234',
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        return {
          success: false,
          error: data?.error || data?.message || 'Invalid college credentials or server response error.',
        };
      }

      const session: CurrentUser = {
        role: 'college',
        profile: data.user.profile,
        authenticated: true,
        token: data.token,
      };

      this.setSession(session);

      if (data.user?.profile?.walletAddress) {
        blockchainService.setActiveWalletAddress(data.user.profile.walletAddress);
      }

      return {
        success: true,
        user: session,
      };
    } catch (e: any) {
      console.error('Login error:', e);
      return {
        success: false,
        error: 'Network error connecting to authentication server.',
      };
    }
  },

  async loginAsStudent(studentIdOrEmail: string): Promise<{ success: boolean; user?: CurrentUser; error?: string }> {
    const students = await credentialService.getStudents();
    const query = studentIdOrEmail.trim().toLowerCase();
    const student = students.find(
      s => s.studentId.toLowerCase() === query || s.email.toLowerCase() === query
    ) || students.find(s => s.studentId.toLowerCase().includes(query));

    if (!student) {
      return {
        success: false,
        error: `Student not found with identifier "${studentIdOrEmail}". Try STU-2022-9102 or STU-2022-8419.`,
      };
    }

    const session: CurrentUser = {
      role: 'student',
      profile: student,
      authenticated: true,
    };
    this.setSession(session);

    // Set connected wallet to student's personal (unauthorized) wallet
    const studentWallet = student.studentId === 'STU-2022-9102'
      ? '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
      : '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
    blockchainService.setActiveWalletAddress(studentWallet);

    return { success: true, user: session };
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Reset to default contract owner wallet
    blockchainService.setActiveWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  }
};
