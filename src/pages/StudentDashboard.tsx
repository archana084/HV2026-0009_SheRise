import React, { useState, useEffect } from 'react';
import { GraduationCap, Building2, Award, Calendar, BookOpen, ShieldCheck, Copy, Check, ExternalLink, RefreshCw, UserCheck, Eye, Sparkles, Download, CheckCircle2, Lock } from 'lucide-react';
import { AcademicCredential, CurrentUser, StudentProfile } from '../types';
import { credentialService } from '../services/credentialService';
import { CredentialCard } from '../components/CredentialCard';
import { CredentialModal } from '../components/CredentialModal';
import { StudentFaqChatbot } from '../components/StudentFaqChatbot';

interface GeneratedProfile {
  studentName: string;
  degreeBranch: string;
  summary: string;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: string | number;
    grade?: string;
  }>;
  certifications: Array<{
    name: string;
    credentialId: string;
    status: string;
    issueDate?: string;
  }>;
  skills: string[];
  generatedAt: string;
}

interface StudentDashboardProps {
  currentUser: CurrentUser;
  onNavigateToVerifier: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchStudent: (student: StudentProfile) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onNavigateToVerifier,
  onShowToast,
  onSwitchStudent,
}) => {
  const student = currentUser.profile as StudentProfile | undefined;
  const [credentials, setCredentials] = useState<AcademicCredential[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<AcademicCredential | null>(null);
  const [copiedStuId, setCopiedStuId] = useState(false);

  const studentId = student?.studentId || 'STU-2022-9102';

  const loadData = async () => {
    try {
      setLoading(true);
      const [creds, studentsList] = await Promise.all([
        credentialService.getCredentialsByStudentId(studentId),
        credentialService.getStudents(),
      ]);
      setCredentials(creds);
      setAllStudents(studentsList);
    } catch (err) {
      console.error(err);
      onShowToast('Error loading credentials', 'Could not fetch records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleCopyStudentId = () => {
    navigator.clipboard.writeText(studentId);
    setCopiedStuId(true);
    onShowToast('Copied Student ID', studentId, 'info');
    setTimeout(() => setCopiedStuId(false), 2000);
  };

  const [aiProfile, setAiProfile] = useState<GeneratedProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);

  useEffect(() => {
    setAiProfile(null);
  }, [studentId]);

  const generateAiProfileData = (
    studentProfile?: StudentProfile,
    userCredentials: AcademicCredential[] = []
  ): GeneratedProfile => {
    const activeCreds = userCredentials.filter(
      (c) => c.status === 'Active' || c.blockchainStatus === 'Registered'
    );

    const name = studentProfile?.name || activeCreds[0]?.studentName || 'Student Profile';
    const degree = studentProfile?.degree || activeCreds[0]?.degree || 'Academic Degree';
    const branch = studentProfile?.branch || activeCreds[0]?.branch || '';
    const institution =
      studentProfile?.institution || activeCreds[0]?.institutionName || 'Academic Institution';
    const gradYear = studentProfile?.graduationYear || activeCreds[0]?.graduationYear || 2026;
    const cgpa = studentProfile?.cgpa || activeCreds[0]?.gradeOrCgpa;

    const educationItems = [
      {
        degree: `${degree}${branch ? ` in ${branch}` : ''}`,
        institution: institution,
        graduationYear: gradYear,
        grade: cgpa,
      },
    ];

    const certItems = activeCreds.map((c) => ({
      name: `${c.credentialType}: ${c.degree} (${c.branch})`,
      credentialId: c.id,
      status: 'Verified',
      issueDate: c.issueDate,
    }));

    const derivedSkillsSet = new Set<string>();

    activeCreds.forEach((c) => {
      const text = `${c.degree} ${c.branch} ${c.remarks || ''}`.toLowerCase();
      if (text.includes('computer science') || text.includes('software')) {
        derivedSkillsSet.add('Computer Science');
        derivedSkillsSet.add('Software Engineering');
        derivedSkillsSet.add('Data Structures & Algorithms');
        derivedSkillsSet.add('Web Development');
      }
      if (
        text.includes('ai') ||
        text.includes('artificial intelligence') ||
        text.includes('data science')
      ) {
        derivedSkillsSet.add('Artificial Intelligence');
        derivedSkillsSet.add('Data Science & Machine Learning');
        derivedSkillsSet.add('Python');
        derivedSkillsSet.add('Data Analytics');
      }
      if (text.includes('blockchain') || text.includes('crypto')) {
        derivedSkillsSet.add('Blockchain Verification');
        derivedSkillsSet.add('Smart Contracts');
      }
      if (text.includes('electrical') || text.includes('electronics')) {
        derivedSkillsSet.add('Circuit Analysis');
        derivedSkillsSet.add('Embedded Systems');
      }
    });

    if (derivedSkillsSet.size === 0) {
      if (branch) derivedSkillsSet.add(branch);
      derivedSkillsSet.add('Academic Research');
      derivedSkillsSet.add('Problem Solving');
      derivedSkillsSet.add('Technical Writing');
    }

    const skillsList = Array.from(derivedSkillsSet);

    const gradeText = cgpa ? ` with academic standing (${cgpa})` : '';
    const certCountText =
      certItems.length === 1
        ? '1 verified academic credential'
        : `${certItems.length} verified academic credentials`;

    const summary = `Accomplished student in ${degree}${branch ? ` (${branch})` : ''} at ${institution}, class of ${gradYear}. Holds ${certCountText} officially registered on-chain via TrustCred${gradeText}. Demonstrated proficiency in ${skillsList.slice(0, 3).join(', ')}.`;

    return {
      studentName: name,
      degreeBranch: `${degree}${branch ? ` — ${branch}` : ''}`,
      summary: summary,
      education: educationItems,
      certifications: certItems,
      skills: skillsList,
      generatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  };

  const handleGenerateProfile = async () => {
    if (credentials.length === 0) {
      onShowToast('No Verified Credentials', 'No verified credentials available to generate your profile.', 'info');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          credentials: credentials
        })
      });
      const data = await res.json();
      if (data.success && data.summary) {
        const localBase = generateAiProfileData(student, credentials);
        setAiProfile({
          ...localBase,
          summary: data.summary,
          skills: data.skills && data.skills.length > 0 ? data.skills : localBase.skills,
        });
        onShowToast('AI Profile Generated', `Powered by ${data.provider || 'Groq AI'}.`, 'success');
      } else {
        const profileData = generateAiProfileData(student, credentials);
        setAiProfile(profileData);
        onShowToast('AI Profile Generated', 'Generated strictly from verified TrustCred credentials.', 'success');
      }
    } catch {
      const profileData = generateAiProfileData(student, credentials);
      setAiProfile(profileData);
      onShowToast('AI Profile Generated', 'Generated strictly from verified TrustCred credentials.', 'success');
    } finally {
      setIsGenerating(false);
    }
  };


  const formatProfileAsText = (profile: GeneratedProfile) => {
    return [
      `==================================================`,
      `VERIFIED ACADEMIC PROFILE — TRUSTCRED`,
      `Generated from verified TrustCred credentials`,
      `==================================================`,
      ``,
      `NAME: ${profile.studentName}`,
      `PROGRAM: ${profile.degreeBranch}`,
      `INSTITUTION: ${profile.education[0]?.institution || 'University'}`,
      `GRADUATION YEAR: ${profile.education[0]?.graduationYear || '2026'}`,
      ``,
      `PROFESSIONAL SUMMARY`,
      `${profile.summary}`,
      ``,
      `EDUCATION`,
      `• ${profile.education[0]?.degree} — ${profile.education[0]?.institution} (${profile.education[0]?.graduationYear})`,
      `${profile.education[0]?.grade ? `  Grade: ${profile.education[0]?.grade}` : ''}`,
      ``,
      `VERIFIED CERTIFICATIONS & CREDENTIALS`,
      ...profile.certifications.map((c) => `• ${c.name} [Verified] (ID: ${c.credentialId})`),
      ``,
      `VERIFIED SKILLS`,
      ...profile.skills.map((s) => `• ${s}`),
      ``,
      `--------------------------------------------------`,
      `Status: Institutionally Verified via TrustCred`,
      `Generated: ${profile.generatedAt}`,
      `--------------------------------------------------`,
    ]
      .filter((line) => line !== null && line !== undefined)
      .join('\n');
  };

  const handleCopyProfile = () => {
    if (!aiProfile) return;
    const text = formatProfileAsText(aiProfile);
    navigator.clipboard.writeText(text);
    setCopiedProfile(true);
    onShowToast('Copied Profile', 'Verified AI profile copied to clipboard.', 'info');
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  const handleDownloadProfile = () => {
    if (!aiProfile) return;
    const text = formatProfileAsText(aiProfile);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${aiProfile.studentName.replace(/\s+/g, '_')}_Verified_Profile.txt`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded Profile', `Saved as ${filename}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100 shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{student?.name || 'Student Profile'}</h1>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {studentId}
                </span>
                <button
                  onClick={handleCopyStudentId}
                  title="Copy Student ID"
                  className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors"
                >
                  {copiedStuId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Student Metadata */}
              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student?.institution || 'JNTUH'}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                  <span><strong>Degree:</strong> {student?.degree || 'Bachelor of Technology (B.Tech)'}</span>
                  <span>•</span>
                  <span><strong>Branch:</strong> {student?.branch || 'Computer Science and Engineering'}</span>
                  <span>•</span>
                  <span><strong>Class of:</strong> {student?.graduationYear || 2026}</span>
                  {student?.cgpa && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">CGPA: {student.cgpa}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs flex flex-col gap-2 min-w-[260px]">
            <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Switch Student Vault:
            </span>
            <select
              value={student?.studentId}
              onChange={(e) => {
                const found = allStudents.find((s) => s.studentId === e.target.value);
                if (found) {
                  onSwitchStudent(found);
                }
              }}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {allStudents.map((s, idx) => (
                <option key={s.id || `${s.studentId}-${idx}`} value={s.studentId}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vault Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">Total Verified Awards</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{credentials.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">Registry Status</span>
            <span className="text-xs font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Active & Verified
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">Digital Issuing Body</span>
            <span className="text-xs font-medium text-slate-800 mt-1 block truncate">
              {student?.institution || 'NITS'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">Sharing Protocol</span>
            <span className="text-xs font-medium text-indigo-700 mt-1 block">
              Direct Credential ID Lookup
            </span>
          </div>
        </div>
      </div>

      {/* AI Credential Profile Section */}
      <div className="bg-white rounded-2xl border border-purple-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">AI Credential Profile</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Lock className="w-2.5 h-2.5" />
                  Verified Source Only
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate a verified professional summary derived strictly from your active TrustCred academic records.
              </p>
            </div>
          </div>

          {aiProfile && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Generated from verified TrustCred credentials</span>
            </div>
          )}
        </div>

        {/* Body */}
        {!aiProfile ? (
          <div className="py-6 text-center space-y-4 max-w-lg mx-auto">
            <p className="text-xs text-slate-600 leading-relaxed">
              Click below to analyze your verified academic credentials and generate an authentic, tamper-evident professional profile summary.
            </p>
            {credentials.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                No verified credentials available to generate your profile.
              </div>
            ) : (
              <button
                onClick={handleGenerateProfile}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Verified Credentials...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Profile</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 bg-slate-50/70 p-6 rounded-xl border border-slate-200/80">
            {/* Student Name & Degree Header */}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{aiProfile.studentName}</h3>
              <p className="text-xs font-semibold text-purple-700">{aiProfile.degreeBranch}</p>
            </div>

            {/* Professional Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Summary</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200/80">
                {aiProfile.summary}
              </p>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h4>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                {aiProfile.education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-semibold text-slate-800">{edu.degree} — {edu.institution}</p>
                    <p className="text-slate-500">Class of {edu.graduationYear} {edu.grade ? `• ${edu.grade}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Certifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Certifications</h4>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-2">
                {aiProfile.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                    <span className="font-medium text-slate-800">
                      • {cert.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Skills</h4>
              <div className="flex flex-wrap gap-2">
                {aiProfile.skills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <Check className="w-3 h-3 text-purple-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust & Safety Tag */}
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generated from verified TrustCred credentials ({aiProfile.generatedAt})</span>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleGenerateProfile}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Profile</span>
              </button>

              <button
                onClick={handleCopyProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                {copiedProfile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedProfile ? 'Copied Profile' : 'Copy Profile'}</span>
              </button>

              <button
                onClick={handleDownloadProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Credentials List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Academic Credentials & Awards</h2>
            <p className="text-xs text-slate-500">
              Verified digital records issued directly by your academic institution.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {credentials.length} Records Found
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">
            Loading student credentials...
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Credentials Found For This Student ID</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your institution has not issued an academic credential for <strong>{studentId}</strong> yet, or it is currently undergoing graduation review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((cred) => (
              <CredentialCard
                key={cred.id}
                credential={cred}
                onViewDetails={(c) => setSelectedCredential(c)}
                onVerify={onNavigateToVerifier}
              />
            ))}
          </div>
        )}
      </div>

      {/* Credential Certificate Modal */}
      <CredentialModal
        credential={selectedCredential}
        onClose={() => setSelectedCredential(null)}
        onNavigateToVerifier={onNavigateToVerifier}
        onCredentialUpdated={(updated) => {
          setSelectedCredential(updated);
          loadData();
          onShowToast('Academic Record Modified (Test)', 'Local data updated. Original blockchain record remains unchanged.', 'info');
        }}
      />

      {/* Guided FAQ Chatbot for Students */}
      <StudentFaqChatbot />
    </div>
  );
};
