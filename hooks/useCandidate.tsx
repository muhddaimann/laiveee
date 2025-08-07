import { useState, useMemo } from "react";

export const mockCandidateData = {
  "20250806C1": {
    candidateDetails: {
      shortName: "Aiman",
      roleAppliedFor: "Customer Service Agent",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Muhammad Aiman",
      candidateEmail: "aiman@example.com",
      candidatePhone: "+60113900822",
      relatedLink: [],
      highestEducation: "Bachelor of Engineering (Computer Engineering), UTeM",
      currentRole: "Final-Year Student",
      yearExperience: 1,
      certsRelate: [],
      professionalSummary:
        "A passionate final-year student with customer-facing experience and tech-savvy communication skills.",
      skillMatch: [
        {
          name: "Communication",
          justification: "Clearly articulated responses during the interview.",
        },
      ],
      experienceMatch: [
        {
          area: "Customer Service",
          justification: "Internship at a call center for 6 months.",
        },
      ],
      roleFit: [
        {
          trait: "Empathy",
          justification: "Shows understanding of customer concerns.",
        },
      ],
      concernArea: ["Lack of real-world full-time experience"],
    },
    interviewPerformance: {
      averageScore: 2.3,
      summary:
        "Good foundational skills, but lacks practical experience in real customer service scenarios.",
      scoreBreakdown: {
        LanguageProficiency: {
          score: 3.0,
          reasoning: "Good command of English with minor fluency gaps.",
        },
        RoleKnowledge: {
          score: 2.0,
          reasoning:
            "Basic understanding of customer service responsibilities.",
        },
        ClarityAndConfidence: {
          score: 2.0,
          reasoning: "Some hesitation in responses, but clear intent.",
        },
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
      shortName: "Sarah",
      roleAppliedFor: "Customer Service Agent",
      interviewLanguage: "Manglish",
    },
    resumeAnalysis: {
      fullName: "Nur Sarah Binti Ahmad",
      candidateEmail: "sarah@example.com",
      candidatePhone: "+60123456789",
      relatedLink: ["linkedin.com/in/sarahahmad"],
      highestEducation: "Diploma in Mass Communication, UiTM",
      currentRole: "Retail Assistant",
      yearExperience: 3,
      certsRelate: ["Customer Service Excellence"],
      professionalSummary:
        "Energetic retail assistant with excellent interpersonal skills and a passion for helping people.",
      skillMatch: [
        {
          name: "Customer Handling",
          justification:
            "Handled hundreds of customer queries weekly in-store.",
        },
      ],
      experienceMatch: [
        {
          area: "Retail Service",
          justification: "Over 3 years in high-volume retail environment.",
        },
      ],
      roleFit: [
        {
          trait: "Friendliness",
          justification: "Warm tone and casual communication style.",
        },
      ],
      concernArea: [],
    },
    interviewPerformance: {
      averageScore: 4.2,
      summary:
        "Great interpersonal and communication skills; highly suitable for front-facing roles.",
      scoreBreakdown: {
        LanguageProficiency: {
          score: 4.0,
          reasoning: "Conversational Manglish used effectively.",
        },
        RoleKnowledge: {
          score: 4.5,
          reasoning: "Shows clear understanding of service standards.",
        },
        ClarityAndConfidence: {
          score: 4.0,
          reasoning: "Very confident and articulate.",
        },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 654,
        outputTokens: 582,
        costUSD: "0.0112",
      },
      interview: {
        inputTokens: 190,
        outputTokens: 92,
        audioDurationSeconds: 75.4,
        costUSD: "0.0095",
      },
      total: {
        costUSD: "0.0207",
        costMYR: "0.10",
      },
    },
    fullTranscript: [],
  },

  "20250806C3": {
    candidateDetails: {
      shortName: "John",
      roleAppliedFor: "Customer Support Executive",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "John Lim",
      candidateEmail: "johnlim@example.com",
      candidatePhone: "+60123411234",
      relatedLink: [],
      highestEducation: "Bachelor of Business Administration, MMU",
      currentRole: "Call Center Executive",
      yearExperience: 5,
      certsRelate: ["Call Center Fundamentals"],
      professionalSummary:
        "Experienced support executive with a track record of meeting SLAs and improving team efficiency.",
      skillMatch: [
        {
          name: "Problem Solving",
          justification: "Quick resolution examples provided.",
        },
      ],
      experienceMatch: [
        {
          area: "BPO",
          justification: "Worked for large BPO clients across regions.",
        },
      ],
      roleFit: [
        { trait: "Composure", justification: "Handled stress scenarios well." },
      ],
      concernArea: ["Some answers were too brief"],
    },
    interviewPerformance: {
      averageScore: 3.8,
      summary:
        "Solid experience and confident demeanor, though could elaborate more.",
      scoreBreakdown: {
        LanguageProficiency: { score: 4.0, reasoning: "Clear and fluent." },
        RoleKnowledge: {
          score: 3.5,
          reasoning: "Good but lacked details on escalation.",
        },
        ClarityAndConfidence: {
          score: 4.0,
          reasoning: "Spoke calmly and confidently.",
        },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 810,
        outputTokens: 612,
        costUSD: "0.0135",
      },
      interview: {
        inputTokens: 203,
        outputTokens: 104,
        audioDurationSeconds: 82.1,
        costUSD: "0.0102",
      },
      total: {
        costUSD: "0.0237",
        costMYR: "0.11",
      },
    },
    fullTranscript: [],
  },

  "20250806C4": {
    candidateDetails: {
      shortName: "Farah",
      roleAppliedFor: "Live Chat Agent",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Farah Lee",
      candidateEmail: "farahlee@example.com",
      candidatePhone: "+60119999888",
      relatedLink: ["portfolio.farahlee.my"],
      highestEducation: "Diploma in IT, Politeknik Ungku Omar",
      currentRole: "Freelancer",
      yearExperience: 2,
      certsRelate: ["Typing Speed Test 90WPM"],
      professionalSummary:
        "Tech-savvy freelancer with fast typing skills and strong written communication background.",
      skillMatch: [
        {
          name: "Written Communication",
          justification:
            "Provided clear, concise written replies in the interview.",
        },
      ],
      experienceMatch: [
        {
          area: "Online Support",
          justification:
            "Experience managing chat platforms for online stores.",
        },
      ],
      roleFit: [
        {
          trait: "Attention to Detail",
          justification: "Spotted inconsistencies in hypothetical scenarios.",
        },
      ],
      concernArea: [],
    },
    interviewPerformance: {
      averageScore: 4.5,
      summary:
        "Excellent candidate for live chat roles with quick thinking and clarity.",
      scoreBreakdown: {
        LanguageProficiency: {
          score: 4.5,
          reasoning: "Very polished written tone.",
        },
        RoleKnowledge: {
          score: 4.5,
          reasoning: "Understood nuances of live chat support.",
        },
        ClarityAndConfidence: {
          score: 4.5,
          reasoning: "Quick and composed answers.",
        },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 690,
        outputTokens: 510,
        costUSD: "0.0110",
      },
      interview: {
        inputTokens: 180,
        outputTokens: 90,
        audioDurationSeconds: 61.8,
        costUSD: "0.0089",
      },
      total: {
        costUSD: "0.0199",
        costMYR: "0.09",
      },
    },
    fullTranscript: [],
  },

  "20250806C5": {
    candidateDetails: {
      shortName: "Hafiz",
      roleAppliedFor: "Customer Advisor",
      interviewLanguage: "English",
    },
    resumeAnalysis: {
      fullName: "Mohd Hafiz Bin Karim",
      candidateEmail: "hafizkarim@example.com",
      candidatePhone: "+60127894567",
      relatedLink: [],
      highestEducation: "SPM",
      currentRole: "Unemployed",
      yearExperience: 0,
      certsRelate: [],
      professionalSummary:
        "Eager to start a customer service career; fast learner with good interpersonal potential.",
      skillMatch: [],
      experienceMatch: [],
      roleFit: [
        {
          trait: "Willingness to Learn",
          justification: "Showed high interest in training.",
        },
      ],
      concernArea: ["No work experience", "Lack of real examples"],
    },
    interviewPerformance: {
      averageScore: 1.8,
      summary: "Very new candidate; needs training but has potential.",
      scoreBreakdown: {
        LanguageProficiency: {
          score: 2.0,
          reasoning: "Understood basic questions.",
        },
        RoleKnowledge: { score: 1.5, reasoning: "Needs more exposure." },
        ClarityAndConfidence: {
          score: 2.0,
          reasoning: "Shy but tried to respond.",
        },
      },
    },
    costEstimation: {
      resumeAnalysis: {
        inputTokens: 480,
        outputTokens: 402,
        costUSD: "0.0094",
      },
      interview: {
        inputTokens: 145,
        outputTokens: 70,
        audioDurationSeconds: 48.1,
        costUSD: "0.0069",
      },
      total: {
        costUSD: "0.0163",
        costMYR: "0.08",
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
