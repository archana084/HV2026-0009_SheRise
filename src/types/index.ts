export type CredentialType =
  | 'Degree Certificate'
  | 'Official Transcript'
  | 'Diploma'
  | 'Postgraduate Degree'
  | 'Course Certificate'
  | 'Honor Award';

export type CredentialStatus = 'Active' | 'Under Review' | 'Archived';

export type BlockchainStatus = 'Registered' | 'Not Registered' | 'Revoked';

export interface AcademicCredential {
  id: string; // Unique Credential ID, e.g. TC-2026-84912
  studentName: string;
  studentId: string;
  studentEmail?: string;
  institutionName: string;
  institutionId?: string;
  degree: string;
  branch: string;
  graduationYear: number;
  issueDate: string; // ISO date YYYY-MM-DD
  gradeOrCgpa: string;
  credentialType: CredentialType;
  status: CredentialStatus;
  createdAt: string;
  remarks?: string;
  certificateHash: string; // 64-character SHA-256 hex digest (Phase 2 Step 1)
  canonicalString?: string; // Optional canonical string for verification/audit
  // Blockchain Record Data (Phase 2)
  blockchainStatus?: BlockchainStatus;
  txHash?: string;
  blockNumber?: number;
  blockchainTimestamp?: number; // Unix timestamp in seconds
  issuerAddress?: string;
}

export interface BlockchainCredentialRecord {
  credentialId: string;
  certificateHash: string;
  institution: string;
  issueTimestamp: number; // Unix timestamp in seconds
  revoked: boolean;
  issuer: string;
  txHash?: string;
  blockNumber?: number;
}

export type BlockchainNetworkMode = 'simulator' | 'metamask' | 'custom_rpc';

export interface BlockchainNetworkConfig {
  mode: BlockchainNetworkMode;
  rpcUrl: string;
  contractAddress: string;
  chainId: number;
}

export type VerificationStatus = 'VERIFIED' | 'TAMPERED' | 'REVOKED' | 'NOT_FOUND' | 'BLOCKCHAIN_NOT_FOUND';

export interface VerificationResult {
  status: VerificationStatus;
  credentialId: string;
  exists: boolean;
  revoked: boolean;
  hashMatches: boolean;
  calculatedHash?: string;
  registeredHash?: string;
  blockchainVerified: boolean;
  found: boolean;
  credential?: AcademicCredential;
  blockchainRecord?: BlockchainCredentialRecord | null;
  queriedId: string;
  verifiedAt: string;
  message: string;
  explanation?: string;
  currentCalculatedHash?: string;
  originalBlockchainHash?: string;
  canonicalString?: string;
  isRevokedOnChain?: boolean;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  institution: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa?: string;
  avatar?: string;
  enrolledDate: string;
}

export type CollegeStatus = 'active' | 'revoked';

export interface InstitutionProfile {
  id: string;
  name: string;
  institutionCode: string;
  email: string;
  accreditation: string;
  location: string;
  established: number;
  contactPerson: string;
  departmentCount: number;
  walletAddress: string; // Registered on-chain approved wallet
  status: CollegeStatus;
}

export type UserRole = 'guest' | 'college' | 'faculty' | 'student' | 'verifier' | 'admin';

export interface CurrentUser {
  role: UserRole;
  profile?: StudentProfile | InstitutionProfile;
  authenticated: boolean;
  token?: string;
}

export interface ConnectedWalletInfo {
  address: string;
  label: string;
  isAuthorized: boolean;
  institutionName?: string;
  institutionCode?: string;
  role: 'authorized_college' | 'unauthorized_student' | 'custom';
}
