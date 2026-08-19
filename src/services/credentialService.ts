import { AcademicCredential, StudentProfile, InstitutionProfile, VerificationResult, BlockchainCredentialRecord } from '../types';
import { calculateCredentialHash, createCanonicalCredentialString } from '../utils/hashUtils';
import { blockchainService } from './blockchainService';
import { authService } from './authService';

const CREDENTIALS_KEY = 'trustcred_credentials_v2';
const STUDENTS_KEY = 'trustcred_students_v1';
const INSTITUTIONS_KEY = 'trustcred_institutions_v1';

// Initial Mock Institutions with real-world premier academic profiles and registered wallet addresses
const DEFAULT_INSTITUTIONS: InstitutionProfile[] = [
  {
    id: 'inst-01',
    name: 'JNTUH',
    institutionCode: 'JNTUH-HYD-01',
    email: 'registrar@jntuh.ac.in',
    accreditation: 'NAAC A+ Grade / UGC Recognized',
    location: 'Kukatpally, Hyderabad, Telangana',
    established: 1965,
    contactPerson: 'Dr. K. Venkateswara Rao (Registrar)',
    departmentCount: 18,
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    status: 'active',
  },
  {
    id: 'inst-02',
    name: 'Osmania University',
    institutionCode: 'OU-HYD-02',
    email: 'registrar@osmania.ac.in',
    accreditation: 'NAAC A+ Grade / University with Potential for Excellence',
    location: 'Hyderabad, Telangana',
    established: 1918,
    contactPerson: 'Prof. P. Laxminarayana (Registrar)',
    departmentCount: 22,
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    status: 'active',
  },
  {
    id: 'inst-03',
    name: 'AUTONOMOUS',
    institutionCode: 'AUTO-COLL-03',
    email: 'principal@autonomous.edu.in',
    accreditation: 'NAAC A Grade / UGC Autonomous Institution',
    location: 'Hyderabad, Telangana',
    established: 1998,
    contactPerson: 'Dr. V. S. R. Murthy (Principal)',
    departmentCount: 10,
    walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    status: 'active',
  },
  {
    id: 'inst-04',
    name: 'SBTET',
    institutionCode: 'SBTET-TS-04',
    email: 'secretary@sbtet.telangana.gov.in',
    accreditation: 'State Board of Technical Education & Training',
    location: 'Hyderabad, Telangana',
    established: 1985,
    contactPerson: 'Dr. C. Srinath (Secretary)',
    departmentCount: 14,
    walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    status: 'active',
  }
];

// Initial Mock Students across colleges
const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-01',
    studentId: 'STU-2022-8419',
    name: 'Aarav Patel',
    email: 'aarav.patel@osmania.ac.in',
    institution: 'Osmania University',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Computer Science and Engineering',
    graduationYear: 2026,
    cgpa: '9.42 / 10.0',
    enrolledDate: '2022-08-01',
  },
  {
    id: 'stu-02',
    studentId: 'STU-2022-9102',
    name: 'Divya Mudavath',
    email: 'divya.mudavath@jntuh.ac.in',
    institution: 'JNTUH',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Artificial Intelligence & Data Science',
    graduationYear: 2026,
    cgpa: '9.68 / 10.0',
    enrolledDate: '2022-08-01',
  },
  {
    id: 'stu-03',
    studentId: 'STU-2021-3310',
    name: 'Elena Rostova',
    email: 'elena.rostova@autonomous.edu.in',
    institution: 'AUTONOMOUS',
    degree: 'Master of Science (M.S.)',
    branch: 'Software Engineering & Cloud Systems',
    graduationYear: 2025,
    cgpa: '3.95 / 4.0',
    enrolledDate: '2023-09-01',
  },
  {
    id: 'stu-04',
    studentId: 'STU-2023-1108',
    name: 'Marcus Vance',
    email: 'marcus.v@sbtet.telangana.gov.in',
    institution: 'SBTET',
    degree: 'Diploma in Engineering',
    branch: 'Cybersecurity & Cryptography',
    graduationYear: 2027,
    cgpa: '8.90 / 10.0',
    enrolledDate: '2023-08-15',
  },
  {
    id: 'stu-05',
    studentId: 'JNTUH-2022-4521',
    name: 'Rohan Sharma',
    email: 'rohan.s@jntuh.ac.in',
    institution: 'JNTUH',
    degree: 'Dual Degree (B.Tech + M.Tech)',
    branch: 'Data Science & Quantum Computing',
    graduationYear: 2026,
    cgpa: '9.85 / 10.0',
    enrolledDate: '2021-08-01',
  }
];

// Initial Mock Credentials (with seeded Phase 2 SHA-256 hashes generated from canonical structure)
const DEFAULT_CREDENTIALS: AcademicCredential[] = [
  {
    id: 'TC-2026-89421',
    studentName: 'Divya Mudavath',
    studentId: 'STU-2022-9102',
    studentEmail: 'divya.mudavath@jntuh.ac.in',
    institutionName: 'JNTUH',
    institutionId: 'inst-01',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Artificial Intelligence & Data Science',
    graduationYear: 2026,
    issueDate: '2026-06-15',
    gradeOrCgpa: '9.68 / 10.0 (First Class with Distinction)',
    credentialType: 'Degree Certificate',
    status: 'Active',
    createdAt: '2026-06-15T10:00:00Z',
    remarks: 'Awarded First Class with Honors for Academic Excellence in Artificial Intelligence.',
    canonicalString: 'CREDENTIAL_ID:TC-2026-89421|STUDENT_NAME:DIVYA MUDAVATH|INSTITUTION:JNTUH|DEGREE:BACHELOR OF TECHNOLOGY (B.TECH)|BRANCH:ARTIFICIAL INTELLIGENCE & DATA SCIENCE|ACADEMIC_YEAR:2026|ISSUE_DATE:2026-06-15|GRADE_CGPA:9.68 / 10.0 (FIRST CLASS WITH DISTINCTION)',
    certificateHash: '610e74734908365b765b07d4f49f3365e917ba181c1384e5ee8b11a5f4017796',
    blockchainStatus: 'Registered',
    txHash: '0x8f2d9c104e198642398ab716ef204981729481adce174982bbfe3920194812aa',
    blockNumber: 1042,
    blockchainTimestamp: 1781517600,
    issuerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  },
  {
    id: 'TC-2026-89422',
    studentName: 'Divya Mudavath',
    studentId: 'STU-2022-9102',
    studentEmail: 'divya.mudavath@jntuh.ac.in',
    institutionName: 'JNTUH',
    institutionId: 'inst-01',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Artificial Intelligence & Data Science',
    graduationYear: 2026,
    issueDate: '2026-06-18',
    gradeOrCgpa: '9.68 / 10.0 (178 Credits Earned)',
    credentialType: 'Official Transcript',
    status: 'Active',
    createdAt: '2026-06-18T14:30:00Z',
    remarks: 'Complete 8-semester official consolidated academic transcript verified by Registrar.',
    canonicalString: 'CREDENTIAL_ID:TC-2026-89422|STUDENT_NAME:DIVYA MUDAVATH|INSTITUTION:JNTUH|DEGREE:BACHELOR OF TECHNOLOGY (B.TECH)|BRANCH:ARTIFICIAL INTELLIGENCE & DATA SCIENCE|ACADEMIC_YEAR:2026|ISSUE_DATE:2026-06-18|GRADE_CGPA:9.68 / 10.0 (178 CREDITS EARNED)',
    certificateHash: '477b73d0e42bf04161c162c8fe0b1ed8250674c0340c13b7eb6f90b6a5022168',
    blockchainStatus: 'Registered',
    txHash: '0x3a9081bcde283948719208341908412891290384aedc09182390184029184021',
    blockNumber: 1045,
    blockchainTimestamp: 1781793000,
    issuerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  },
  {
    id: 'TC-2026-77319',
    studentName: 'Aarav Patel',
    studentId: 'STU-2022-8419',
    studentEmail: 'aarav.patel@osmania.ac.in',
    institutionName: 'Osmania University',
    institutionId: 'inst-02',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Computer Science and Engineering',
    graduationYear: 2026,
    issueDate: '2026-06-15',
    gradeOrCgpa: '9.42 / 10.0',
    credentialType: 'Degree Certificate',
    status: 'Active',
    createdAt: '2026-06-15T11:20:00Z',
    remarks: 'Completed graduation requirements with Department Gold Medal.',
    canonicalString: 'CREDENTIAL_ID:TC-2026-77319|STUDENT_NAME:AARAV PATEL|INSTITUTION:OSMANIA UNIVERSITY|DEGREE:BACHELOR OF TECHNOLOGY (B.TECH)|BRANCH:COMPUTER SCIENCE AND ENGINEERING|ACADEMIC_YEAR:2026|ISSUE_DATE:2026-06-15|GRADE_CGPA:9.42 / 10.0',
    certificateHash: '7cf395731c0064eb5cc195f41d267a692646077a0e57f02d5ec3b34bd95c02da',
    blockchainStatus: 'Registered',
    txHash: '0xc109283019284091820491820491820498102948102948102948102948102948',
    blockNumber: 1043,
    blockchainTimestamp: 1781522400,
    issuerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
  {
    id: 'TC-2025-41092',
    studentName: 'Elena Rostova',
    studentId: 'STU-2021-3310',
    studentEmail: 'elena.rostova@autonomous.edu.in',
    institutionName: 'AUTONOMOUS',
    institutionId: 'inst-03',
    degree: 'Master of Science (M.S.)',
    branch: 'Software Engineering & Cloud Systems',
    graduationYear: 2025,
    issueDate: '2025-12-20',
    gradeOrCgpa: '3.95 / 4.0 GPA',
    credentialType: 'Postgraduate Degree',
    status: 'Active',
    createdAt: '2025-12-20T09:15:00Z',
    remarks: 'Thesis: Scalable Distributed Ledger Microservices in High-Throughput Academic Networks.',
    canonicalString: 'CREDENTIAL_ID:TC-2025-41092|STUDENT_NAME:ELENA ROSTOVA|INSTITUTION:AUTONOMOUS|DEGREE:MASTER OF SCIENCE (M.S.)|BRANCH:SOFTWARE ENGINEERING & CLOUD SYSTEMS|ACADEMIC_YEAR:2025|ISSUE_DATE:2025-12-20|GRADE_CGPA:3.95 / 4.0 GPA',
    certificateHash: 'a0d47eded799027021f958d9da4b70f34dc17432cc4ad2e7381325a33e138c19',
    blockchainStatus: 'Revoked',
    txHash: '0x5189204810928401928401928401928401928401928401928401928401928401',
    blockNumber: 988,
    blockchainTimestamp: 1766222100,
    issuerAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  }
];

function getStorageItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultVal;
  }
}

function setStorageItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Generate unique formatted credential ID
export function generateCredentialId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `TC-${year}-${randomNum}`;
}

export const credentialService = {
  // Fetch all credentials (optionally filter by institution)
  async getCredentials(institutionName?: string): Promise<AcademicCredential[]> {
    const credentials = getStorageItem<AcademicCredential[]>(CREDENTIALS_KEY, DEFAULT_CREDENTIALS);
    
    // Ensure all stored credentials have valid SHA-256 hashes & sync on-chain statuses
    let updated = false;
    for (const cred of credentials) {
      const { canonicalString, certificateHash } = await calculateCredentialHash({
        id: cred.id,
        studentName: cred.studentName,
        institutionName: cred.institutionName,
        degree: cred.degree,
        branch: cred.branch,
        graduationYear: cred.graduationYear,
        issueDate: cred.issueDate,
        gradeOrCgpa: cred.gradeOrCgpa,
      });

      // Maintain canonical string and calculate certificate hash if uninitialized
      if (!cred.canonicalString) {
        cred.canonicalString = canonicalString;
        updated = true;
      }
      if (!cred.certificateHash || cred.certificateHash.length !== 64) {
        cred.certificateHash = certificateHash;
        updated = true;
      }

      // Check on-chain record for synchronization
      let onChainRecord = await blockchainService.getCredential(cred.id);
      
      // Auto-anchor registered credentials if simulator state was missing
      if (!onChainRecord && cred.blockchainStatus === 'Registered') {
        try {
          const simState = getStorageItem<Record<string, BlockchainCredentialRecord>>('trustcred_blockchain_state_v1', {});
          const currentTimestamp = cred.blockchainTimestamp || Math.floor(Date.now() / 1000);
          const blockNum = cred.blockNumber || 1042;
          const issuer = cred.issuerAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
          const txHash = cred.txHash || `0x8f2d9c104e198642398ab716ef204981729481adce174982bbfe3920194812aa`;

          const anchorRecord: BlockchainCredentialRecord = {
            credentialId: cred.id.trim().toUpperCase(),
            certificateHash: cred.certificateHash,
            institution: cred.institutionName,
            issueTimestamp: currentTimestamp,
            revoked: false,
            issuer,
            txHash,
            blockNumber: blockNum,
          };
          simState[cred.id.trim().toUpperCase()] = anchorRecord;
          localStorage.setItem('trustcred_blockchain_state_v1', JSON.stringify(simState));
          onChainRecord = anchorRecord;
        } catch {
          // ignore
        }
      }

      if (onChainRecord) {
        const onChainStatus = onChainRecord.revoked ? 'Revoked' : 'Registered';
        if (cred.blockchainStatus !== onChainStatus || cred.txHash !== onChainRecord.txHash) {
          cred.blockchainStatus = onChainStatus;
          cred.txHash = onChainRecord.txHash;
          cred.blockNumber = onChainRecord.blockNumber;
          cred.blockchainTimestamp = onChainRecord.issueTimestamp;
          cred.issuerAddress = onChainRecord.issuer;
          updated = true;
        }
      } else if (!cred.blockchainStatus) {
        cred.blockchainStatus = 'Not Registered';
        updated = true;
      }
    }
    if (updated) {
      setStorageItem(CREDENTIALS_KEY, credentials);
    }

    if (institutionName) {
      return credentials.filter(c => c.institutionName.toLowerCase() === institutionName.toLowerCase());
    }
    return credentials;
  },

  // Fetch credentials for a specific student
  async getCredentialsByStudentId(studentId: string): Promise<AcademicCredential[]> {
    const credentials = await this.getCredentials();
    return credentials.filter(c => c.studentId.trim().toUpperCase() === studentId.trim().toUpperCase());
  },

  // Search by exact Credential ID
  async getCredentialById(credentialId: string): Promise<AcademicCredential | null> {
    const credentials = await this.getCredentials();
    const cleanId = credentialId.trim().toUpperCase();
    const found = credentials.find(c => c.id.toUpperCase() === cleanId);
    return found || null;
  },

  // Create new academic credential with deterministic Web Crypto SHA-256 hash
  async createCredential(
    data: Omit<AcademicCredential, 'id' | 'createdAt' | 'status' | 'certificateHash'> & { 
      customId?: string; 
      status?: 'Active' | 'Under Review' | 'Archived';
      autoRegisterOnBlockchain?: boolean;
    }
  ): Promise<AcademicCredential> {
    const session = authService.getCurrentSession();
    if (!authService.isCollegeUser(session)) {
      throw new Error('Access Denied: Only authorized College Admin accounts can issue new credentials.');
    }

    const credentials = await this.getCredentials();
    
    const assignedId = data.customId || generateCredentialId();

    // 1. Create canonical representation using fixed-order fields
    // 2. Generate deterministic 64-char SHA-256 digest with Web Crypto API
    const { canonicalString, certificateHash } = await calculateCredentialHash({
      id: assignedId,
      studentName: data.studentName,
      institutionName: data.institutionName,
      degree: data.degree,
      branch: data.branch,
      graduationYear: data.graduationYear,
      issueDate: data.issueDate,
      gradeOrCgpa: data.gradeOrCgpa,
    });

    let blockchainStatus: 'Registered' | 'Not Registered' = 'Not Registered';
    let txHash: string | undefined;
    let blockNumber: number | undefined;
    let blockchainTimestamp: number | undefined;
    let issuerAddress: string | undefined;

    if (data.autoRegisterOnBlockchain) {
      const receipt = await blockchainService.registerCredential(
        assignedId,
        certificateHash,
        data.institutionName
      );
      blockchainStatus = 'Registered';
      txHash = receipt.txHash;
      blockNumber = receipt.blockNumber;
      blockchainTimestamp = receipt.timestamp;
      issuerAddress = receipt.issuer;
    }

    const newCredential: AcademicCredential = {
      ...data,
      id: assignedId,
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      canonicalString,
      certificateHash,
      blockchainStatus,
      txHash,
      blockNumber,
      blockchainTimestamp,
      issuerAddress,
    };

    const updated = [newCredential, ...credentials];
    setStorageItem(CREDENTIALS_KEY, updated);
    return newCredential;
  },

  /**
   * Register an existing credential on the blockchain smart contract
   */
  async registerCredentialOnBlockchain(credentialId: string): Promise<AcademicCredential> {
    const session = authService.getCurrentSession();
    if (!authService.isCollegeUser(session)) {
      throw new Error('Access Denied: Only authorized College Admin accounts can register credentials on the blockchain.');
    }

    const credentials = await this.getCredentials();
    const cleanId = credentialId.trim().toUpperCase();
    const index = credentials.findIndex(c => c.id.toUpperCase() === cleanId);
    
    if (index === -1) {
      throw new Error(`Credential with ID ${credentialId} not found.`);
    }

    const cred = credentials[index];
    if (!cred.certificateHash || cred.certificateHash.length !== 64) {
      throw new Error('Credential does not have a valid 64-character SHA-256 hash.');
    }

    // Call smart contract via blockchainService
    const receipt = await blockchainService.registerCredential(
      cred.id,
      cred.certificateHash,
      cred.institutionName
    );

    const updatedCred: AcademicCredential = {
      ...cred,
      blockchainStatus: 'Registered',
      txHash: receipt.txHash,
      blockNumber: receipt.blockNumber,
      blockchainTimestamp: receipt.timestamp,
      issuerAddress: receipt.issuer,
    };

    credentials[index] = updatedCred;
    setStorageItem(CREDENTIALS_KEY, credentials);
    return updatedCred;
  },

  /**
   * Revoke a credential on the blockchain smart contract
   */
  async revokeCredentialOnBlockchain(credentialId: string): Promise<AcademicCredential> {
    const session = authService.getCurrentSession();
    if (!authService.isCollegeUser(session)) {
      throw new Error('Access Denied: Only authorized College Admin accounts can revoke academic credentials.');
    }

    const credentials = await this.getCredentials();
    const cleanId = credentialId.trim().toUpperCase();
    const index = credentials.findIndex(c => c.id.toUpperCase() === cleanId);
    
    if (index === -1) {
      throw new Error(`Credential with ID ${credentialId} not found in database.`);
    }

    const cred = credentials[index];

    // Call smart contract revokeCredential()
    const receipt = await blockchainService.revokeCredential(cred.id);

    const updatedCred: AcademicCredential = {
      ...cred,
      blockchainStatus: 'Revoked',
      txHash: receipt.txHash,
      blockNumber: receipt.blockNumber,
    };

    credentials[index] = updatedCred;
    setStorageItem(CREDENTIALS_KEY, credentials);
    return updatedCred;
  },

  // Re-verify deterministic hash generation for any credential
  async recomputeCredentialHash(credential: AcademicCredential): Promise<{
    calculatedHash: string;
    canonicalString: string;
    matches: boolean;
  }> {
    const { canonicalString, certificateHash } = await calculateCredentialHash({
      id: credential.id,
      studentName: credential.studentName,
      institutionName: credential.institutionName,
      degree: credential.degree,
      branch: credential.branch,
      graduationYear: credential.graduationYear,
      issueDate: credential.issueDate,
      gradeOrCgpa: credential.gradeOrCgpa,
    });

    return {
      calculatedHash: certificateHash,
      canonicalString,
      matches: certificateHash.toLowerCase() === credential.certificateHash.toLowerCase(),
    };
  },

  // Fetch all registered students
  async getStudents(institutionName?: string): Promise<StudentProfile[]> {
    const rawStudents = getStorageItem<StudentProfile[]>(STUDENTS_KEY, DEFAULT_STUDENTS);
    let hasUpdated = false;
    const students = rawStudents.map((s, idx) => {
      if (!s.id) {
        hasUpdated = true;
        return { ...s, id: `stu-${idx}-${Date.now()}` };
      }
      return s;
    });

    if (hasUpdated) {
      setStorageItem(STUDENTS_KEY, students);
    }

    if (institutionName) {
      return students.filter(s => s.institution.toLowerCase() === institutionName.toLowerCase());
    }
    return students;
  },

  // Add a new student record
  async addStudent(studentData: Omit<StudentProfile, 'id'>): Promise<StudentProfile> {
    const students = await this.getStudents();
    const newStudent: StudentProfile = {
      ...studentData,
      id: `stu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newStudent, ...students];
    setStorageItem(STUDENTS_KEY, updated);
    return newStudent;
  },

  // Fetch registered institutions
  async getInstitutions(): Promise<InstitutionProfile[]> {
    const institutions = getStorageItem<InstitutionProfile[]>(INSTITUTIONS_KEY, DEFAULT_INSTITUTIONS);
    // Ensure all default institutions are present and updated with walletAddress if older cached schema exists
    if (!institutions || institutions.length < DEFAULT_INSTITUTIONS.length) {
      setStorageItem(INSTITUTIONS_KEY, DEFAULT_INSTITUTIONS);
      return DEFAULT_INSTITUTIONS;
    }
    return institutions;
  },

  // Add a new institution to the dynamic scalable registry
  async addInstitution(institutionData: Omit<InstitutionProfile, 'id'>): Promise<InstitutionProfile> {
    const institutions = await this.getInstitutions();
    const newInst: InstitutionProfile = {
      ...institutionData,
      id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: institutionData.status || 'active',
    };
    const updated = [...institutions, newInst];
    setStorageItem(INSTITUTIONS_KEY, updated);

    // Also register in blockchain authorized issuers
    if (newInst.walletAddress && newInst.status === 'active') {
      blockchainService.authorizeIssuer(newInst.walletAddress, `${newInst.name} (${newInst.institutionCode})`, newInst.name);
    }
    return newInst;
  },

  /**
   * Update academic record fields in local database ONLY (Tamper Test Support).
   * IMPORTANT: Leaves the on-chain blockchain record completely unchanged!
   * Recalculates the local hash so it reflects the modified data.
   */
  async updateCredentialAcademicData(
    credentialId: string,
    updatedFields: Partial<Pick<AcademicCredential, 'studentName' | 'institutionName' | 'degree' | 'branch' | 'graduationYear' | 'gradeOrCgpa' | 'issueDate' | 'remarks' | 'credentialType'>>
  ): Promise<AcademicCredential> {
    const credentials = await this.getCredentials();
    const cleanId = credentialId.trim().toUpperCase();
    const index = credentials.findIndex(c => c.id.toUpperCase() === cleanId);

    if (index === -1) {
      throw new Error(`Credential with ID ${credentialId} not found.`);
    }

    const currentCred = credentials[index];
    const updatedData = {
      ...currentCred,
      ...updatedFields,
    };

    // Recalculate local hash for the modified data
    const { canonicalString, certificateHash } = await calculateCredentialHash({
      id: updatedData.id,
      studentName: updatedData.studentName,
      institutionName: updatedData.institutionName,
      degree: updatedData.degree,
      branch: updatedData.branch,
      graduationYear: updatedData.graduationYear,
      issueDate: updatedData.issueDate,
      gradeOrCgpa: updatedData.gradeOrCgpa,
    });

    const modifiedCredential: AcademicCredential = {
      ...updatedData,
      canonicalString,
      certificateHash,
      // Note: blockchainStatus, txHash, blockNumber are preserved but the on-chain hash is NOT updated
    };

    credentials[index] = modifiedCredential;
    setStorageItem(CREDENTIALS_KEY, credentials);
    return modifiedCredential;
  },

  /**
   * Tamper Simulation Helper: Modifies academic data (e.g. CGPA: 8.5 -> 9.5)
   * while keeping on-chain blockchain record completely intact.
   */
  async tamperCredential(
    credentialId: string,
    tamperedGradeOrCgpa: string = '9.98 / 10.0 (Tampered First Class)',
    tamperedDegree?: string
  ): Promise<AcademicCredential> {
    return this.updateCredentialAcademicData(credentialId, {
      gradeOrCgpa: tamperedGradeOrCgpa,
      ...(tamperedDegree ? { degree: tamperedDegree } : {}),
      remarks: 'Simulated modified record for tamper detection testing.',
    });
  },

  /**
   * Verify a credential by ID:
   * 1. Retrieve the academic credential record from registrar store.
   * 2. Retrieve the blockchain record from TrustCredRegistry smart contract.
   * 3. Independently reconstruct canonical credential string and calculate SHA-256 hash using Web Crypto API.
   * 4. Compare currentCalculatedHash vs blockchainStoredHash.
   * 5. Apply Case Priority:
   *    - Priority 1: If blockchain record not found -> NOT_FOUND
   *    - Priority 2: If blockchain record exists and revoked == true -> REVOKED
   *    - Priority 3: If not revoked and hashes differ -> TAMPERED
   *    - Priority 4: If not revoked and hashes match -> VERIFIED
   */
  async verifyCredential(credentialId: string): Promise<VerificationResult> {
    // Artificial small delay for UX realism
    await new Promise(res => setTimeout(res, 350));
    
    const cleanId = credentialId.trim().toUpperCase();
    const [cred, onChainRecord] = await Promise.all([
      this.getCredentialById(cleanId),
      blockchainService.getCredential(cleanId),
    ]);

    // Case 1: Blockchain Record does NOT exist
    if (!onChainRecord) {
      return {
        status: 'NOT_FOUND',
        credentialId: cleanId,
        exists: false,
        revoked: false,
        hashMatches: false,
        blockchainVerified: false,
        found: false,
        queriedId: cleanId,
        verifiedAt: new Date().toISOString(),
        message: 'No credential record found registered on the blockchain for this ID.',
        explanation: 'The entered Credential ID does not exist on the TrustCredRegistry smart contract.',
        credential: cred || undefined,
        blockchainRecord: null,
        isRevokedOnChain: false,
      };
    }

    // Retrieve original on-chain certificate hash
    const originalBlockchainHash = onChainRecord.certificateHash.trim().toLowerCase();

    // If academic data exists, calculate fresh SHA-256 hash independently
    let currentCalculatedHash: string | undefined;
    let canonicalString: string | undefined;
    let hashMatches = false;

    if (cred) {
      const hashResult = await calculateCredentialHash({
        id: cred.id,
        studentName: cred.studentName,
        institutionName: cred.institutionName,
        degree: cred.degree,
        branch: cred.branch,
        graduationYear: cred.graduationYear,
        issueDate: cred.issueDate,
        gradeOrCgpa: cred.gradeOrCgpa,
      });

      currentCalculatedHash = hashResult.certificateHash.trim().toLowerCase();
      canonicalString = hashResult.canonicalString;
      hashMatches = currentCalculatedHash === originalBlockchainHash;
    }

    // Case 2: Priority — REVOKED (Takes precedence over normal verified/tampered)
    if (onChainRecord.revoked) {
      return {
        status: 'REVOKED',
        credentialId: cleanId,
        exists: true,
        revoked: true,
        hashMatches,
        blockchainVerified: false,
        found: true,
        queriedId: cleanId,
        verifiedAt: new Date().toISOString(),
        message: 'This credential has been officially revoked by the issuing institution.',
        explanation: 'The issuing institution registrar has permanently marked this record as revoked on the blockchain smart contract.',
        credential: cred || undefined,
        blockchainRecord: onChainRecord,
        currentCalculatedHash,
        originalBlockchainHash,
        canonicalString,
        isRevokedOnChain: true,
      };
    }

    // Case 3: TAMPERED (Hashes do not match)
    if (!hashMatches) {
      return {
        status: 'TAMPERED',
        credentialId: cleanId,
        exists: true,
        revoked: false,
        hashMatches: false,
        blockchainVerified: false,
        found: true,
        queriedId: cleanId,
        verifiedAt: new Date().toISOString(),
        message: 'The current credential data does not match the hash recorded on the blockchain.',
        explanation: 'One or more credential fields may have been modified after issuance. The calculated SHA-256 digest of the current academic data differs from the immutable cryptographic digest stored on the smart contract.',
        credential: cred || undefined,
        blockchainRecord: onChainRecord,
        currentCalculatedHash,
        originalBlockchainHash,
        canonicalString,
        isRevokedOnChain: false,
      };
    }

    // Case 4: VERIFIED (Hashes match & Not Revoked)
    return {
      status: 'VERIFIED',
      credentialId: cleanId,
      exists: true,
      revoked: false,
      hashMatches: true,
      blockchainVerified: true,
      found: true,
      queriedId: cleanId,
      verifiedAt: new Date().toISOString(),
      message: 'Credential is authentic and has not been modified.',
      explanation: 'The SHA-256 hash calculated from the current credential data perfectly matches the original hash recorded on the blockchain.',
      credential: cred || undefined,
      blockchainRecord: onChainRecord,
      currentCalculatedHash,
      originalBlockchainHash,
      canonicalString,
      isRevokedOnChain: false,
    };
  },

  // Reset demo data to defaults
  async resetDemoData(): Promise<void> {
    setStorageItem(CREDENTIALS_KEY, DEFAULT_CREDENTIALS);
    setStorageItem(STUDENTS_KEY, DEFAULT_STUDENTS);
    setStorageItem(INSTITUTIONS_KEY, DEFAULT_INSTITUTIONS);
    blockchainService.resetSimulatorState();
  }
};
