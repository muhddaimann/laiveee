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
      candidateEmail: "muhddaimann@gmail.com",
      candidatePhone: "012-3456789",
      relatedLink: ["linkedin.com/in/maimano"],
      highestEducation: "Diploma in Mass Communication",
      certsRelate: ["Customer Service Excellence Certificate"],
      currentRole: "Retail Assistant",
      yearExperience: 2,
      professionalSummary:
        "An experienced retail assistant with strong communication skills and a knack for resolving customer issues. Proven ability to work in fast-paced environments and maintain a positive attitude.",
      skillMatch: [
        {
          name: "Communication",
          justification: "Experience as a retail assistant",
        },
        {
          name: "Problem-Solving",
          justification: "Handled customer complaints",
        },
      ],
      experienceMatch: [
        {
          area: "Customer Interaction",
          justification: "Daily interaction with customers in a retail setting",
        },
      ],
      concernArea: ["No direct call center experience"],
      strengths: [
        {
          trait: "Interpersonal Skills",
          justification:
            "Effectively communicates with a diverse range of customers.",
        },
      ],
      roleFit: {
        roleScore: 7,
        justification:
          "Good foundational skills for a customer service role, but lacks specific industry experience.",
      },
    },
    interviewPerformance: {
      scoreBreakdown: {
        spokenAbility: {
          score: 4,
          reasoning: "Speaks clearly and fluently.",
        },
        behavior: {
          score: 5,
          reasoning: "Maintained a professional and friendly demeanor.",
        },
        communicationStyle: {
          score: 4,
          reasoning: "Articulate and easy to understand.",
        },
      },
      knockoutBreakdown: {
        earliestAvailability: "2025-09-01",
        expectedSalary: "MYR 3,500",
        rotationalShift: "Yes",
        ableCommute: "Yes",
        workFlex: "Yes",
      },
      averageScore: 4.3,
      summary:
        "A promising candidate with excellent soft skills. Would require some training on company-specific tools.",
    },
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
    ? {
        id: selectedCandidateId,
        ...(mockCandidateData as any)[selectedCandidateId],
      }
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
