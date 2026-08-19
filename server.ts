import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();


const app = express();
const PORT = 3000;

// Initialize Groq AI Client safely
let groq: Groq | null = null;
try {
  const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (groqApiKey && typeof groqApiKey === 'string' && groqApiKey.trim()) {
    groq = new Groq({ apiKey: groqApiKey.trim() });
  }
} catch (e) {
  console.error('Groq SDK Initialization Warning:', e);
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for Vercel deployment & cross-origin API calls
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-College-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize request URL for Vercel Serverless Function rewrites (/api/... vs /...)
app.use((req, res, next) => {
  if (req.url) {
    req.url = req.url.replace(/\/index(?:\.ts|\.js)?$/, '');
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }
  }
  next();
});

// Safe Body Normalization Middleware for Vercel Serverless Functions
app.use((req: any, res, next) => {
  if (!req.body) {
    req.body = {};
  } else if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      req.body = {};
    }
  }
  next();
});





// Canonical string generator matching src/utils/hashUtils.ts
function createCanonicalCredentialString(data: {
  id: string;
  studentName: string;
  institutionName: string;
  degree: string;
  branch: string;
  graduationYear: string | number;
  issueDate: string;
  gradeOrCgpa?: string;
}): string {
  const normId = (data.id || '').trim().toUpperCase();
  const normStudent = (data.studentName || '').trim().toUpperCase();
  const normInstitution = (data.institutionName || '').trim().toUpperCase();
  const normDegree = (data.degree || '').trim().toUpperCase();
  const normBranch = (data.branch || '').trim().toUpperCase();
  const normYear = String(data.graduationYear || '').trim();
  const normIssueDate = (data.issueDate || '').trim();
  const normGrade = (data.gradeOrCgpa || '').trim().toUpperCase();

  return [
    `CREDENTIAL_ID:${normId}`,
    `STUDENT_NAME:${normStudent}`,
    `INSTITUTION:${normInstitution}`,
    `DEGREE:${normDegree}`,
    `BRANCH:${normBranch}`,
    `ACADEMIC_YEAR:${normYear}`,
    `ISSUE_DATE:${normIssueDate}`,
    `GRADE_CGPA:${normGrade}`
  ].join('|');
}

function calculateSHA256(canonicalString: string): string {
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex').toLowerCase();
}

interface AcademicCredential {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail?: string;
  institutionName: string;
  institutionId?: string;
  degree: string;
  branch: string;
  graduationYear: number;
  issueDate: string;
  gradeOrCgpa: string;
  credentialType: string;
  status: string;
  createdAt: string;
  remarks?: string;
  certificateHash: string;
  canonicalString?: string;
  blockchainStatus?: 'Registered' | 'Not Registered' | 'Revoked';
  txHash?: string;
  blockNumber?: number;
  blockchainTimestamp?: number;
  issuerAddress?: string;
}

interface BlockchainCredentialRecord {
  credentialId: string;
  certificateHash: string;
  institution: string;
  issueTimestamp: number;
  revoked: boolean;
  issuer: string;
  txHash?: string;
  blockNumber?: number;
}

const INITIAL_CREDENTIALS: AcademicCredential[] = [
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

const INITIAL_BLOCKCHAIN_RECORDS: Record<string, BlockchainCredentialRecord> = {
  'TC-2026-89421': {
    credentialId: 'TC-2026-89421',
    certificateHash: '610e74734908365b765b07d4f49f3365e917ba181c1384e5ee8b11a5f4017796',
    institution: 'JNTUH',
    issueTimestamp: 1781517600,
    revoked: false,
    issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    txHash: '0x8f2d9c104e198642398ab716ef204981729481adce174982bbfe3920194812aa',
    blockNumber: 1042,
  },
  'TC-2026-89422': {
    credentialId: 'TC-2026-89422',
    certificateHash: '477b73d0e42bf04161c162c8fe0b1ed8250674c0340c13b7eb6f90b6a5022168',
    institution: 'JNTUH',
    issueTimestamp: 1781793000,
    revoked: false,
    issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    txHash: '0x3a9081bcde283948719208341908412891290384aedc09182390184029184021',
    blockNumber: 1045,
  },
  'TC-2026-77319': {
    credentialId: 'TC-2026-77319',
    certificateHash: '7cf395731c0064eb5cc195f41d267a692646077a0e57f02d5ec3b34bd95c02da',
    institution: 'Osmania University',
    issueTimestamp: 1781522400,
    revoked: false,
    issuer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    txHash: '0xc109283019284091820491820491820498102948102948102948102948102948',
    blockNumber: 1043,
  },
  'TC-2025-41092': {
    credentialId: 'TC-2025-41092',
    certificateHash: 'a0d47eded799027021f958d9da4b70f34dc17432cc4ad2e7381325a33e138c19',
    institution: 'AUTONOMOUS',
    issueTimestamp: 1766222100,
    revoked: true,
    issuer: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    txHash: '0x5189204810928401928401928401928401928401928401928401928401928401',
    blockNumber: 988,
  }
};

// In-Memory Authoritative Store
let credentialsStore: AcademicCredential[] = JSON.parse(JSON.stringify(INITIAL_CREDENTIALS));
let blockchainStateStore: Record<string, BlockchainCredentialRecord> = JSON.parse(JSON.stringify(INITIAL_BLOCKCHAIN_RECORDS));
let currentBlockNumber = 1050;

// ==========================================
// COLLEGE AUTHENTICATION & SECURITY ENGINE
// ==========================================
interface RegisteredInstitution {
  id: string;
  name: string;
  institutionCode: string;
  email: string;
  walletAddress: string;
  status: 'active' | 'revoked';
}

const REGISTERED_INSTITUTIONS: RegisteredInstitution[] = [
  {
    id: 'inst-01',
    name: 'JNTUH',
    institutionCode: 'JNTUH-HYD-01',
    email: 'registrar@jntuh.ac.in',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    status: 'active',
  },
  {
    id: 'inst-02',
    name: 'Osmania University',
    institutionCode: 'OU-HYD-02',
    email: 'registrar@osmania.ac.in',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    status: 'active',
  },
  {
    id: 'inst-03',
    name: 'AUTONOMOUS',
    institutionCode: 'AUTO-COLL-03',
    email: 'principal@autonomous.edu.in',
    walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    status: 'active',
  },
  {
    id: 'inst-04',
    name: 'SBTET',
    institutionCode: 'SBTET-TS-04',
    email: 'secretary@sbtet.telangana.gov.in',
    walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    status: 'active',
  },
];

interface AuthorizedCollegeUser {
  email: string;
  institutionId: string;
  name: string;
  role: 'college' | 'admin';
}

const AUTHORIZED_COLLEGE_USERS: AuthorizedCollegeUser[] = [
  // trrcollege121@gmail.com Authorized for ALL FOUR Institutions
  { email: 'trrcollege121@gmail.com', institutionId: 'inst-01', name: 'JNTUH College Administrator (TRR)', role: 'college' },
  { email: 'trrcollege121@gmail.com', institutionId: 'inst-02', name: 'OU College Administrator (TRR)', role: 'college' },
  { email: 'trrcollege121@gmail.com', institutionId: 'inst-03', name: 'AUTONOMOUS College Administrator (TRR)', role: 'college' },
  { email: 'trrcollege121@gmail.com', institutionId: 'inst-04', name: 'SBTET College Administrator (TRR)', role: 'college' },

  // Institutional Default Accounts
  { email: 'registrar@jntuh.ac.in', institutionId: 'inst-01', name: 'JNTUH Registrar', role: 'college' },
  { email: 'registrar@osmania.ac.in', institutionId: 'inst-02', name: 'OU Registrar', role: 'college' },
  { email: 'principal@autonomous.edu.in', institutionId: 'inst-03', name: 'AUTONOMOUS Principal', role: 'college' },
  { email: 'secretary@sbtet.telangana.gov.in', institutionId: 'inst-04', name: 'SBTET Secretary', role: 'college' },
];

interface CollegeActiveSession {
  token: string;
  email: string;
  institution: RegisteredInstitution;
  createdAt: number;
}

const collegeSessionsStore: Record<string, CollegeActiveSession> = {};

// Helper middleware for server-side role & token verification
function verifyCollegeAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-college-token'] as string);
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token || !collegeSessionsStore[token]) {
    return res.status(401).json({
      error: 'Your session has expired. Please sign in again.',
      code: 'UNAUTHORIZED_COLLEGE_ACTION'
    });
  }

  const session = collegeSessionsStore[token];
  if (session.institution.status === 'revoked') {
    return res.status(403).json({
      error: 'Access Denied: Institution authorization has been revoked.',
      code: 'INSTITUTION_REVOKED'
    });
  }

  (req as any).collegeSession = session;
  next();
}

// ------------------------------------------
// AUTHENTICATION & LOGIN API ENDPOINT
// ------------------------------------------

// College Portal Login (Institution + Email + Password)
app.post('/api/auth/college/login', (req, res) => {
  const body = req.body || {};
  const { institutionId, email, password } = body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanInstId = (institutionId || '').trim();


  if (!cleanEmail) {
    return res.status(400).json({ error: 'Registered email address is required.' });
  }

  // 1. Find target institution by ID or Name
  const inst = REGISTERED_INSTITUTIONS.find(
    i => i.id === cleanInstId || i.name.toLowerCase() === cleanInstId.toLowerCase()
  );

  if (!inst) {
    return res.status(400).json({
      error: 'This account is not authorized for this institution.'
    });
  }

  if (inst.status === 'revoked') {
    return res.status(403).json({
      error: `Access denied: Institution "${inst.name}" authorization has been revoked.`
    });
  }

  // 2. Verify email is registered/authorized for this selected institution
  const authorizedUser = AUTHORIZED_COLLEGE_USERS.find(
    u => u.email.toLowerCase() === cleanEmail && u.institutionId === inst.id
  );

  if (!authorizedUser) {
    return res.status(401).json({
      error: 'This account is not authorized for this institution.'
    });
  }

  // 3. Verify password
  if (!password || password !== 'demo1234') {
    return res.status(401).json({ error: 'Invalid college credentials.' });
  }

  // 4. Generate secure authorization session token
  const sessionToken = `trustcred_sec_${crypto.randomBytes(24).toString('hex')}`;
  collegeSessionsStore[sessionToken] = {
    token: sessionToken,
    email: cleanEmail,
    institution: inst,
    createdAt: Date.now(),
  };

  return res.json({
    success: true,
    token: sessionToken,
    user: {
      role: 'college',
      profile: inst,
      authenticated: true,
    }
  });
});

// ==========================================
// 1. Health API & AI Status
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    blockNumber: currentBlockNumber, 
    credentialsCount: credentialsStore.length,
    aiProvider: groq ? 'Groq (llama-3.3-70b-versatile)' : 'Mock/Fallback (Configure GROQ_API_KEY for Groq AI)'
  });
});

// ==========================================
// Groq AI API Endpoints
// ==========================================

// 1. AI Credential Audit & Analysis Endpoint
app.post('/api/ai/analyze-credential', async (req, res) => {
  try {
    const { credential, verificationStatus } = req.body || {};
    if (!credential) {

      return res.status(400).json({ error: 'Credential data required' });
    }

    if (groq) {
      const prompt = `You are the TrustCred AI Intelligence Engine, an expert academic credential and blockchain security auditor.
Analyze the following academic credential record and verification status:

CREDENTIAL DATA:
- Credential ID: ${credential.id}
- Student Name: ${credential.studentName}
- Institution: ${credential.institutionName}
- Degree/Program: ${credential.degree} (${credential.branch})
- Graduation Year: ${credential.graduationYear}
- Grade/CGPA: ${credential.gradeOrCgpa}
- Credential Type: ${credential.credentialType}
- Blockchain Status: ${credential.blockchainStatus || 'Registered'}
- Verification Status: ${verificationStatus || 'VERIFIED'}

Analyze this credential and provide a JSON response with EXACTLY the following structure (no extra text or markdown codeblocks outside JSON):
{
  "auditSummary": "A concise 2-sentence professional verification analysis of this credential.",
  "authenticityScore": 98,
  "riskLevel": "LOW",
  "keyTakeaways": ["point 1", "point 2", "point 3"],
  "verifiedSkills": ["Skill 1", "Skill 2", "Skill 3"]
}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return res.json({ success: true, provider: 'Groq (llama-3.3-70b-versatile)', ...parsed });
      }
    }

    // Fallback response if Groq API key is not configured
    const isTampered = verificationStatus === 'TAMPERED';
    const isRevoked = verificationStatus === 'REVOKED';
    return res.json({
      success: true,
      provider: 'TrustCred Engine (Offline Fallback)',
      auditSummary: isTampered
        ? 'ALERT: Cryptographic hash mismatch detected! Academic record data has been altered after issuance.'
        : isRevoked
        ? 'REVOKED: This credential was revoked on-chain by the issuing university registrar.'
        : 'Authentic Credential: Cryptographic SHA-256 digest matches the immutable blockchain register perfectly.',
      authenticityScore: isTampered || isRevoked ? 0 : 99,
      riskLevel: isTampered || isRevoked ? 'HIGH' : 'LOW',
      keyTakeaways: [
        `Issuing Institution: ${credential.institutionName}`,
        `Degree: ${credential.degree} in ${credential.branch}`,
        `Status: ${verificationStatus || 'VERIFIED'}`
      ],
      verifiedSkills: [credential.branch, credential.degree, 'Verified Academic Credential']
    });
  } catch (error: any) {
    console.error('Groq AI Credential Analysis Error:', error);
    res.status(500).json({ error: 'AI analysis failed', message: error?.message });
  }
});

// 2. AI Credential Profile Generation Endpoint
app.post('/api/ai/generate-profile', async (req, res) => {
  try {
    const { studentName, credentials } = req.body || {};
    if (!credentials || !Array.isArray(credentials)) {

      return res.status(400).json({ error: 'Credentials array required' });
    }

    if (groq) {
      const prompt = `You are the TrustCred AI Career Profile Generator.
Synthesize the following verified academic credentials for student ${studentName || 'Student'} into a professional summary profile:

CREDENTIALS LIST:
${JSON.stringify(credentials, null, 2)}

Provide a JSON object with EXACTLY this structure:
{
  "studentName": "${studentName || 'Student'}",
  "summary": "A 3-sentence executive professional summary highlighting achievements and qualifications based strictly on these verified credentials.",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "careerBadges": ["Badge 1", "Badge 2", "Badge 3"]
}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return res.json({ success: true, provider: 'Groq AI (llama-3.3-70b-versatile)', ...parsed });
      }
    }

    // Fallback response
    return res.json({
      success: true,
      provider: 'TrustCred Engine (Offline Fallback)',
      studentName: studentName || 'Student',
      summary: `Verified graduate with ${credentials.length} authentic academic credentials registered on TrustCred. Demonstrated excellence across coursework and degree programs.`,
      skills: Array.from(new Set(credentials.map(c => c.branch || c.degree).filter(Boolean))),
      careerBadges: ['TrustCred Verified Graduate', 'Blockchain Authenticated', 'Academic Excellence']
    });
  } catch (error: any) {
    console.error('Groq AI Profile Generation Error:', error);
    res.status(500).json({ error: 'AI Profile Generation failed', message: error?.message });
  }
});

// 3. AI Assistant Chatbot Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) {

      return res.status(400).json({ error: 'Message is required' });
    }

    if (groq) {
      const systemMessage = {
        role: 'system' as const,
        content: `You are TrustCred AI Assistant, an expert AI chatbot on the TrustCred Academic Credential Verification Platform.
Help students, colleges, and verifiers/employers understand credential issuance, SHA-256 canonical hashing, blockchain smart contracts, tamper detection, QR code verification, and security features.
Be concise, helpful, friendly, and structured.`
      };

      const formattedHistory = (history || []).map((h: any) => ({
        role: h.sender === 'user' || h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: h.text || h.content || ''
      }));

      const completion = await groq.chat.completions.create({
        messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 400
      });

      const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
      return res.json({ success: true, provider: 'Groq (llama-3.3-70b-versatile)', reply });
    }

    // Fallback static answer
    return res.json({
      success: true,
      provider: 'TrustCred Bot (Offline Mode)',
      reply: `TrustCred uses cryptographic SHA-256 hashing and Ethereum smart contracts to ensure credentials cannot be forged or tampered with. (Configure GROQ_API_KEY in .env for live Groq AI answers!)`
    });
  } catch (error: any) {
    console.error('Groq AI Chat Error:', error);
    res.status(500).json({ error: 'Groq AI Chat failed', message: error?.message });
  }
});


// ==========================================
// 2. Authoritative Verification API Endpoint
// ==========================================
app.get('/api/verify/:credentialId', (req, res) => {
  const cleanId = (req.params.credentialId || '').trim().toUpperCase();

  const cred = credentialsStore.find(c => c.id.toUpperCase() === cleanId);
  const onChainRecord = blockchainStateStore[cleanId];

  // STEP 1: CREDENTIAL EXISTENCE CHECK
  if (!cred) {
    return res.json({
      status: 'NOT_FOUND',
      credentialId: cleanId,
      exists: false,
      revoked: false,
      hashMatches: false,
      blockchainVerified: false,
      found: false,
      queriedId: cleanId,
      verifiedAt: new Date().toISOString(),
      message: 'This credential could not be found in the TrustCred registry.',
      explanation: 'No record matching this Credential ID exists in the registrar database.',
      credential: null,
      blockchainRecord: onChainRecord || null,
      isRevokedOnChain: Boolean(onChainRecord?.revoked),
    });
  }

  // STEP 2: BLOCKCHAIN RECORD CHECK
  if (!onChainRecord) {
    return res.json({
      status: 'BLOCKCHAIN_NOT_FOUND',
      credentialId: cleanId,
      exists: true,
      revoked: false,
      hashMatches: false,
      blockchainVerified: false,
      found: false,
      queriedId: cleanId,
      verifiedAt: new Date().toISOString(),
      message: 'No blockchain record found for this credential.',
      explanation: 'The academic record exists, but it has not been registered on the TrustCredRegistry smart contract.',
      credential: cred,
      blockchainRecord: null,
      isRevokedOnChain: false,
    });
  }

  const originalBlockchainHash = (onChainRecord.certificateHash || '').trim().toLowerCase();

  // STEP 4: RECALCULATE SHA-256 HASH FROM CURRENT CANONICAL DATA
  const canonicalString = createCanonicalCredentialString({
    id: cred.id,
    studentName: cred.studentName,
    institutionName: cred.institutionName,
    degree: cred.degree,
    branch: cred.branch,
    graduationYear: cred.graduationYear,
    issueDate: cred.issueDate,
    gradeOrCgpa: cred.gradeOrCgpa,
  });

  const currentCalculatedHash = calculateSHA256(canonicalString);
  const hashMatches = currentCalculatedHash === originalBlockchainHash;

  // STEP 3 & 6: REVOCATION CHECK (HIGHEST DECISION PRIORITY)
  if (onChainRecord.revoked === true) {
    return res.json({
      status: 'REVOKED',
      credentialId: cleanId,
      exists: true,
      revoked: true,
      hashMatches,
      calculatedHash: currentCalculatedHash,
      registeredHash: originalBlockchainHash,
      blockchainVerified: false,
      found: true,
      queriedId: cleanId,
      verifiedAt: new Date().toISOString(),
      message: 'This credential was revoked by the issuing institution and must not be accepted as a currently valid credential.',
      explanation: 'The issuing university registrar formally executed a revocation transaction on the TrustCredRegistry smart contract.',
      credential: cred,
      blockchainRecord: onChainRecord,
      currentCalculatedHash,
      originalBlockchainHash,
      canonicalString,
      isRevokedOnChain: true,
    });
  }

  // STEP 4 & 6: TAMPER DETECTION
  if (!hashMatches) {
    return res.json({
      status: 'TAMPERED',
      credentialId: cleanId,
      exists: true,
      revoked: false,
      hashMatches: false,
      calculatedHash: currentCalculatedHash,
      registeredHash: originalBlockchainHash,
      blockchainVerified: false,
      found: true,
      queriedId: cleanId,
      verifiedAt: new Date().toISOString(),
      message: 'The credential data does not match the original registered record. The credential may have been modified after issuance.',
      explanation: 'The calculated SHA-256 cryptographic digest of the current academic data differs from the immutable hash stored on the blockchain.',
      credential: cred,
      blockchainRecord: onChainRecord,
      currentCalculatedHash,
      originalBlockchainHash,
      canonicalString,
      isRevokedOnChain: false,
    });
  }

  // STEP 5: VALID CREDENTIAL (ALL CHECKS PASSED)
  return res.json({
    status: 'VERIFIED',
    credentialId: cleanId,
    exists: true,
    revoked: false,
    hashMatches: true,
    calculatedHash: currentCalculatedHash,
    registeredHash: originalBlockchainHash,
    blockchainVerified: true,
    found: true,
    queriedId: cleanId,
    verifiedAt: new Date().toISOString(),
    message: 'Credential Verified: Cryptographically Valid & Authentic',
    explanation: 'The credential exists on the blockchain, is officially active (not revoked), and its current academic data perfectly matches the immutable SHA-256 hash.',
    credential: cred,
    blockchainRecord: onChainRecord,
    currentCalculatedHash,
    originalBlockchainHash,
    canonicalString,
    isRevokedOnChain: false,
  });
});

// ==========================================
// 3. Credentials REST Endpoints
// ==========================================
app.get('/api/credentials', (req, res) => {
  res.json(credentialsStore);
});

app.get('/api/credentials/:id', (req, res) => {
  const cleanId = (req.params.id || '').trim().toUpperCase();
  const cred = credentialsStore.find(c => c.id.toUpperCase() === cleanId);
  if (!cred) return res.status(404).json({ error: 'Credential not found' });
  res.json(cred);
});

app.post('/api/credentials', verifyCollegeAuth, (req, res) => {
  const newCred = req.body as AcademicCredential;
  if (!newCred.id) {
    return res.status(400).json({ error: 'Missing credential id' });
  }
  const cleanId = newCred.id.trim().toUpperCase();
  const existingIdx = credentialsStore.findIndex(c => c.id.toUpperCase() === cleanId);

  const canonicalString = createCanonicalCredentialString({
    id: cleanId,
    studentName: newCred.studentName,
    institutionName: newCred.institutionName,
    degree: newCred.degree,
    branch: newCred.branch,
    graduationYear: newCred.graduationYear,
    issueDate: newCred.issueDate,
    gradeOrCgpa: newCred.gradeOrCgpa,
  });
  const certificateHash = calculateSHA256(canonicalString);

  const finalizedCred: AcademicCredential = {
    ...newCred,
    id: cleanId,
    canonicalString,
    certificateHash,
  };

  if (existingIdx !== -1) {
    credentialsStore[existingIdx] = finalizedCred;
  } else {
    credentialsStore.unshift(finalizedCred);
  }
  res.json(finalizedCred);
});

// Blockchain Registration
app.post('/api/credentials/register-blockchain', verifyCollegeAuth, (req, res) => {
  const { credentialId, issuerAddress } = req.body || {};
  const cleanId = (credentialId || '').trim().toUpperCase();

  const credIdx = credentialsStore.findIndex(c => c.id.toUpperCase() === cleanId);

  if (credIdx === -1) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  const cred = credentialsStore[credIdx];
  currentBlockNumber += 1;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const txHash = '0x' + crypto.createHash('sha256').update(`TX_REG:${cleanId}:${currentTimestamp}:${currentBlockNumber}`).digest('hex');

  const onChainRecord: BlockchainCredentialRecord = {
    credentialId: cleanId,
    certificateHash: cred.certificateHash,
    institution: cred.institutionName,
    issueTimestamp: currentTimestamp,
    revoked: false,
    issuer: issuerAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    txHash,
    blockNumber: currentBlockNumber,
  };

  blockchainStateStore[cleanId] = onChainRecord;

  cred.blockchainStatus = 'Registered';
  cred.txHash = txHash;
  cred.blockNumber = currentBlockNumber;
  cred.blockchainTimestamp = currentTimestamp;
  cred.issuerAddress = onChainRecord.issuer;

  credentialsStore[credIdx] = cred;
  res.json({ credential: cred, blockchainRecord: onChainRecord });
});

// Revocation
app.post('/api/credentials/revoke', verifyCollegeAuth, (req, res) => {
  const { credentialId } = req.body || {};
  const cleanId = (credentialId || '').trim().toUpperCase();


  const credIdx = credentialsStore.findIndex(c => c.id.toUpperCase() === cleanId);
  const onChainRecord = blockchainStateStore[cleanId];

  if (!onChainRecord && credIdx === -1) {
    return res.status(404).json({ error: 'Credential not found on blockchain or database' });
  }

  currentBlockNumber += 1;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const txHash = '0x' + crypto.createHash('sha256').update(`TX_REVOKE:${cleanId}:${currentTimestamp}:${currentBlockNumber}`).digest('hex');

  if (onChainRecord) {
    onChainRecord.revoked = true;
    onChainRecord.txHash = txHash;
    onChainRecord.blockNumber = currentBlockNumber;
    blockchainStateStore[cleanId] = onChainRecord;
  } else {
    blockchainStateStore[cleanId] = {
      credentialId: cleanId,
      certificateHash: credentialsStore[credIdx].certificateHash,
      institution: credentialsStore[credIdx].institutionName,
      issueTimestamp: currentTimestamp,
      revoked: true,
      issuer: credentialsStore[credIdx].issuerAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      txHash,
      blockNumber: currentBlockNumber,
    };
  }

  if (credIdx !== -1) {
    credentialsStore[credIdx].blockchainStatus = 'Revoked';
    credentialsStore[credIdx].txHash = txHash;
    credentialsStore[credIdx].blockNumber = currentBlockNumber;
  }

  res.json({
    success: true,
    credentialId: cleanId,
    revoked: true,
    txHash,
    blockNumber: currentBlockNumber,
    credential: credIdx !== -1 ? credentialsStore[credIdx] : null,
    blockchainRecord: blockchainStateStore[cleanId],
  });
});

// Tamper simulation endpoint (modifies academic fields while leaving immutable on-chain hash intact)
app.post('/api/credentials/tamper', (req, res) => {
  const { credentialId, updatedFields } = req.body || {};
  const cleanId = (credentialId || '').trim().toUpperCase();

  const credIdx = credentialsStore.findIndex(c => c.id.toUpperCase() === cleanId);

  if (credIdx === -1) {
    return res.status(404).json({ error: 'Credential not found in database' });
  }

  const currentCred = credentialsStore[credIdx];
  const modifiedCred: AcademicCredential = {
    ...currentCred,
    ...updatedFields,
  };

  // Recalculate local hash for the modified data
  const canonicalString = createCanonicalCredentialString({
    id: modifiedCred.id,
    studentName: modifiedCred.studentName,
    institutionName: modifiedCred.institutionName,
    degree: modifiedCred.degree,
    branch: modifiedCred.branch,
    graduationYear: modifiedCred.graduationYear,
    issueDate: modifiedCred.issueDate,
    gradeOrCgpa: modifiedCred.gradeOrCgpa,
  });

  modifiedCred.canonicalString = canonicalString;
  modifiedCred.certificateHash = calculateSHA256(canonicalString);
  // Note: on-chain record in blockchainStateStore[cleanId] is NOT touched!

  credentialsStore[credIdx] = modifiedCred;
  res.json(modifiedCred);
});

// Reset server state
app.post('/api/credentials/reset', (req, res) => {
  credentialsStore = JSON.parse(JSON.stringify(INITIAL_CREDENTIALS));
  blockchainStateStore = JSON.parse(JSON.stringify(INITIAL_BLOCKCHAIN_RECORDS));
  currentBlockNumber = 1050;
  res.json({ success: true, message: 'Authoritative server store reset to defaults.' });
});

// Blockchain State Lookup
app.get('/api/blockchain/record/:id', (req, res) => {
  const cleanId = (req.params.id || '').trim().toUpperCase();
  const record = blockchainStateStore[cleanId];
  if (!record) return res.status(404).json({ error: 'Blockchain record not found' });
  res.json(record);
});

app.get('/api/blockchain/state', (req, res) => {
  res.json(blockchainStateStore);
});

// Global Error Handler for Express API Server
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Error Handler caught exception:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected server error occurred.'
  });
});


// ==========================================
// Vite Middleware / Static Serving Setup
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustCred Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

