import React, { createContext, useState, useContext, ReactNode } from "react";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { PublicCandidate } from "./api/candidate";

interface SkillMatch {
  name: string;
  justification: string;
}

interface ExperienceMatch {
  area: string;
  justification: string;
}

interface Strength {
  trait: string;
  justification: string;
}

interface RoleFit {
  roleScore: number;
  justification: string;
}

export interface CandidateData {
  fullName: string;
  candidateEmail: string;
  candidatePhone: string;
  relatedLink: string[];
  highestEducation: string;
  certsRelate: string[];
  currentRole: string;
  yearExperience: number;
  professionalSummary: string;
  skillMatch: SkillMatch[];
  experienceMatch: ExperienceMatch[];
  concernArea: string[];
  strengths: Strength[];
  roleFit: RoleFit;
}

export interface InterviewScores {
  scoreBreakdown: {
    spokenAbility: { score: number; reasoning: string };
    behavior: { score: number; reasoning: string };
    communicationStyle: { score: number; reasoning: string };
  };
  knockoutBreakdown: {
    earliestAvailability: string;
    expectedSalary: string;
    rotationalShift: string;
    ableCommute: string;
    workFlex: string;
  };
  costEstimation: {
    inputTokens: number;
    outputTokens: number;
    whisperDurationSec: number;
  };
  fullTranscript: string;
  averageScore: number;
  summary: string;
}

export interface UsageData {
  inputTokens?: number;
  outputTokens?: number;
  audioInputDuration?: number;
}

type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

interface DContextType {
  publicCandidate: PublicCandidate | null;
  setPublicCandidate: (candidate: PublicCandidate | null) => void;
  languagePref: LanguagePref | null;
  setLanguagePref: (lang: LanguagePref | null) => void;
  scores: InterviewScores | null;
  setScores: (scores: InterviewScores | null) => void;
  conversation: ItemType[];
  setConversation: React.Dispatch<React.SetStateAction<ItemType[]>>;
  interviewUsage: UsageData | null;
  setInterviewUsage: (usage: UsageData | null) => void;
  candidateData: CandidateData | null;
  setCandidateData: (data: CandidateData | null) => void;
  analysisUsage: UsageData | null;
  setAnalysisUsage: (usage: UsageData | null) => void;
}

const DContext = createContext<DContextType | undefined>(undefined);

export function DProvider({ children }: { children: ReactNode }) {
  const [publicCandidate, setPublicCandidate] = useState<PublicCandidate | null>(
    null
  );
  const [languagePref, setLanguagePref] = useState<LanguagePref | null>(
    "English"
  );
  const [scores, setScores] = useState<InterviewScores | null>(null);
  const [conversation, setConversation] = useState<ItemType[]>([]);
  const [interviewUsage, setInterviewUsage] = useState<UsageData | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [analysisUsage, setAnalysisUsage] = useState<UsageData | null>(null);

  const value = {
    publicCandidate,
    setPublicCandidate,
    languagePref,
    setLanguagePref,
    scores,
    setScores,
    conversation,
    setConversation,
    interviewUsage,
    setInterviewUsage,
    candidateData,
    setCandidateData,
    analysisUsage,
    setAnalysisUsage,
  };

  return <DContext.Provider value={value}>{children}</DContext.Provider>;
}

export function useDContext() {
  const context = useContext(DContext);
  if (context === undefined) {
    throw new Error("useDContext must be used within a DProvider");
  }
  return context;
}
