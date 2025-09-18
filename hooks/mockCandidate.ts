import { useState } from "react";

export type ScoreItem = { score: number; reasoning: string };

export type CandidateUI = {
  id: string;
  candidateDetails: { roleAppliedFor: string };
  resumeAnalysis: {
    fullName: string;
    candidateEmail?: string;
    candidatePhone?: string;
    relatedLink?: string[];
    highestEducation?: string;
    currentRole?: string;
    professionalSummary?: string;
    strengths?: { trait: string; justification: string }[];
    skillMatch?: { name: string; justification: string }[];
    experienceMatch?: { area: string; justification: string }[];
    concernArea?: string[];
    roleFit: { roleScore: number; justification: string };
  };
  interviewPerformance: {
    averageScore?: number;
    summary?: string;
    scoreBreakdown: {
      spokenAbility: ScoreItem;
      behavior: ScoreItem;
      communicationStyle: ScoreItem;
      [k: string]: ScoreItem;
    };
    knockoutBreakdown: Record<string, string>;
  };
};

export const MOCK_CANDIDATES: CandidateUI[] = [

];

export function useMockCandidates() {
  const [candidates, setCandidates] = useState<CandidateUI[]>(MOCK_CANDIDATES);
  const findById = (id: string) =>
    MOCK_CANDIDATES.find((c) => c.id === id.trim()) || null;
  return { candidates, setCandidates, findById };
}
