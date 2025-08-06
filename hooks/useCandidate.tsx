import { useState, useMemo } from "react";

const mockCandidateData = {
  "20250806C1": {
    candidateDetails: {
      shortName: "Aiman",
      roleAppliedFor: "Customer Service Agent",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Muhammad Aiman",
      email: "aiman@example.com",
      phone: "+60113900822",
      relatedLinks: [],
      highestEducation: {
        degree: "Bachelor of Engineering",
        major: "Computer Engineering",
        institution: "UTeM",
        date: "2021–Present",
      },
      certificationsRelated: [],
      currentRole: "Final-Year Student",
      totalExperienceYears: 1,
      professionalSummary: "Summary 1",
      skillMatch: [],
      experienceMatch: [],
      concernAreas: [],
      roleFitTraits: [],
    },
    interviewPerformance: {
      averageScore: "2.3/5",
      summary: "Summary 1",
      scoreBreakdown: {
        languageProficiency: { score: "3.0/5", reasoning: "Reason 1" },
        roleKnowledge: { score: "2.0/5", reasoning: "Reason 1" },
        clarityAndConfidence: { score: "2.0/5", reasoning: "Reason 1" },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 771,
        outputTokens: 604,
        costUSD: "0.0129",
      },
      interview: {
        inputTokens: 169,
        outputTokens: 83.5,
        audioDurationSeconds: 62.897,
        costUSD: "0.0084",
      },
      total: {
        costUSD: "0.0213",
        costMYR: "0.10",
      },
    },
    fullTranscript: [],
  },
  "20250806C2": {
    candidateDetails: {
      shortName: "Bella",
      roleAppliedFor: "Sales Assistant",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Isabella Tan",
      email: "bella@example.com",
      phone: "+60112223333",
      relatedLinks: [],
      highestEducation: {
        degree: "Diploma",
        major: "Retail Management",
        institution: "Sunway College",
        date: "2019–2021",
      },
      certificationsRelated: [],
      currentRole: "Sales Intern",
      totalExperienceYears: 2,
      professionalSummary: "Summary 2",
      skillMatch: [],
      experienceMatch: [],
      concernAreas: [],
      roleFitTraits: [],
    },
    interviewPerformance: {
      averageScore: "3.8/5",
      summary: "Summary 2",
      scoreBreakdown: {
        languageProficiency: { score: "4.0/5", reasoning: "Reason 2" },
        roleKnowledge: { score: "3.5/5", reasoning: "Reason 2" },
        clarityAndConfidence: { score: "4.0/5", reasoning: "Reason 2" },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 500,
        outputTokens: 400,
        costUSD: "0.0100",
      },
      interview: {
        inputTokens: 120,
        outputTokens: 90,
        audioDurationSeconds: 48.234,
        costUSD: "0.0075",
      },
      total: {
        costUSD: "0.0175",
        costMYR: "0.08",
      },
    },
    fullTranscript: [],
  },
  "20250806C3": {
    candidateDetails: {
      shortName: "Chan",
      roleAppliedFor: "Customer Support",
      interviewLanguage: "Mandarin",
    },
    resumeAnalysis: {
      fullName: "Chan Wai Kit",
      email: "chan@example.com",
      phone: "+60118889999",
      relatedLinks: [],
      highestEducation: {
        degree: "Bachelor",
        major: "Mass Communication",
        institution: "UTAR",
        date: "2020–2024",
      },
      certificationsRelated: [],
      currentRole: "Student",
      totalExperienceYears: 0,
      professionalSummary: "Summary 3",
      skillMatch: [],
      experienceMatch: [],
      concernAreas: [],
      roleFitTraits: [],
    },
    interviewPerformance: {
      averageScore: "4.5/5",
      summary: "Summary 3",
      scoreBreakdown: {
        languageProficiency: { score: "5.0/5", reasoning: "Reason 3" },
        roleKnowledge: { score: "4.0/5", reasoning: "Reason 3" },
        clarityAndConfidence: { score: "4.5/5", reasoning: "Reason 3" },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 600,
        outputTokens: 420,
        costUSD: "0.0112",
      },
      interview: {
        inputTokens: 110,
        outputTokens: 85,
        audioDurationSeconds: 54.712,
        costUSD: "0.0069",
      },
      total: {
        costUSD: "0.0181",
        costMYR: "0.09",
      },
    },
    fullTranscript: [],
  },
  "20250806C4": {
    candidateDetails: {
      shortName: "Dina",
      roleAppliedFor: "Admin Executive",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Nur Dina",
      email: "dina@example.com",
      phone: "+60117778888",
      relatedLinks: [],
      highestEducation: {
        degree: "Bachelor",
        major: "Business Administration",
        institution: "UiTM",
        date: "2019–2023",
      },
      certificationsRelated: [],
      currentRole: "Admin Assistant",
      totalExperienceYears: 1,
      professionalSummary: "Summary 4",
      skillMatch: [],
      experienceMatch: [],
      concernAreas: [],
      roleFitTraits: [],
    },
    interviewPerformance: {
      averageScore: "4.0/5",
      summary: "Summary 4",
      scoreBreakdown: {
        languageProficiency: { score: "4.0/5", reasoning: "Reason 4" },
        roleKnowledge: { score: "4.0/5", reasoning: "Reason 4" },
        clarityAndConfidence: { score: "4.0/5", reasoning: "Reason 4" },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 580,
        outputTokens: 410,
        costUSD: "0.0108",
      },
      interview: {
        inputTokens: 140,
        outputTokens: 95,
        audioDurationSeconds: 58.103,
        costUSD: "0.0072",
      },
      total: {
        costUSD: "0.0180",
        costMYR: "0.09",
      },
    },
    fullTranscript: [],
  },
  "20250806C5": {
    candidateDetails: {
      shortName: "Elvin",
      roleAppliedFor: "Marketing Assistant",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Elvin Low",
      email: "elvin@example.com",
      phone: "+60110011234",
      relatedLinks: [],
      highestEducation: {
        degree: "Diploma",
        major: "Marketing",
        institution: "TARUC",
        date: "2020–2022",
      },
      certificationsRelated: [],
      currentRole: "Marketing Trainee",
      totalExperienceYears: 1,
      professionalSummary: "Summary 5",
      skillMatch: [],
      experienceMatch: [],
      concernAreas: [],
      roleFitTraits: [],
    },
    interviewPerformance: {
      averageScore: "3.2/5",
      summary: "Summary 5",
      scoreBreakdown: {
        languageProficiency: { score: "3.0/5", reasoning: "Reason 5" },
        roleKnowledge: { score: "3.5/5", reasoning: "Reason 5" },
        clarityAndConfidence: { score: "3.0/5", reasoning: "Reason 5" },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 640,
        outputTokens: 470,
        costUSD: "0.0115",
      },
      interview: {
        inputTokens: 125,
        outputTokens: 90,
        audioDurationSeconds: 59.431,
        costUSD: "0.0071",
      },
      total: {
        costUSD: "0.0186",
        costMYR: "0.09",
      },
    },
    fullTranscript: [],
  },
};

export type Candidate =
  (typeof mockCandidateData)[keyof typeof mockCandidateData];

export const useCandidates = () => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const candidates = useMemo(
    () =>
      Object.entries(mockCandidateData).map(([id, data]) => ({ id, ...data })),
    []
  );

  const handleSelectCandidate = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedCandidateId(id);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (id: string) => {
    if ((mockCandidateData as any)[id]) {
      handleSelectCandidate(id);
    } else {
      alert("Candidate ID not found.");
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCandidateId(null);
  };

  const selectedCandidateData = selectedCandidateId
    ? ((mockCandidateData as any)[selectedCandidateId] as Candidate)
    : null;

  return {
    candidates,
    selectedCandidateData,
    loading,
    handleSearch,
    handleSelectCandidate,
    handleBackToDashboard,
  };
};
