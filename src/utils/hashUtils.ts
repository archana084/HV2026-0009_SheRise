/**
 * TrustCred Cryptographic Hashing Utilities (Phase 2 Step 1)
 * 
 * Uses the browser's built-in native Web Crypto API (crypto.subtle.digest)
 * to deterministically generate 64-character SHA-256 hexadecimal digests.
 */

export interface CredentialHashPayload {
  id: string;
  studentName: string;
  institutionName: string;
  degree: string;
  branch: string;
  graduationYear: string | number;
  issueDate: string;
  gradeOrCgpa?: string;
}

/**
 * Creates a normalized canonical credential string using fixed-order fields:
 * 1. Credential ID
 * 2. Student name
 * 3. Institution/college name
 * 4. Degree
 * 5. Branch/course
 * 6. Academic year
 * 7. Issue date
 * 8. CGPA/grade if available
 * 
 * Normalization:
 * - Trims unnecessary whitespace
 * - Standardizes casing (uppercase for textual integrity)
 * - Guarantees strict identical field ordering
 */
export function createCanonicalCredentialString(data: CredentialHashPayload): string {
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

/**
 * Generates a 64-character lowercase SHA-256 hexadecimal hash
 * using the browser's native Web Crypto API (crypto.subtle.digest).
 * 
 * @param canonicalString The normalized canonical UTF-8 representation of the credential.
 * @returns Promise<string> 64-character hex string (e.g. 'a3f7c9...')
 */
export async function generateSHA256Hash(canonicalString: string): Promise<string> {
  // Encode as UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalString);

  // Compute SHA-256 digest using native Web Crypto API
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toLowerCase();
  }

  // Fallback for environments where Web Crypto API is unavailable
  throw new Error('Web Crypto API (crypto.subtle.digest) is not available in the current environment.');
}

/**
 * Convenience helper to calculate SHA-256 certificate hash directly from credential payload.
 */
export async function calculateCredentialHash(payload: CredentialHashPayload): Promise<{
  canonicalString: string;
  certificateHash: string;
}> {
  const canonicalString = createCanonicalCredentialString(payload);
  const certificateHash = await generateSHA256Hash(canonicalString);
  return { canonicalString, certificateHash };
}
