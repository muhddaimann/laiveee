import React, { createContext, useState, useContext, ReactNode } from "react";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";

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

interface HContextType {
  shortName: string | null;
  setShortName: (name: string | null) => void;
  roleApply: string | null;
  setRoleApply: (role: string | null) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  languagePref: LanguagePref | null;
  setLanguagePref: (lang: LanguagePref | null) => void;
  candidateData: CandidateData | null;
  setCandidateData: (data: CandidateData | null) => void;
  scores: InterviewScores | null;
  setScores: (scores: InterviewScores | null) => void;
  conversation: ItemType[];
  setConversation: React.Dispatch<React.SetStateAction<ItemType[]>>;
  interviewUsage: UsageData | null;
  setInterviewUsage: (usage: UsageData | null) => void;
  analysisUsage: UsageData | null;
  setAnalysisUsage: (usage: UsageData | null) => void;
}

const HContext = createContext<HContextType | undefined>(undefined);

export function HProvider({ children }: { children: ReactNode }) {
  const [shortName, setShortName] = useState<string | null>("");
  const [roleApply, setRoleApply] = useState<string | null>(
    "Customer Service Agent"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [languagePref, setLanguagePref] = useState<LanguagePref | null>(
    "English"
  );
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [scores, setScores] = useState<InterviewScores | null>(null);
  const [conversation, setConversation] = useState<ItemType[]>([]);
  const [interviewUsage, setInterviewUsage] = useState<UsageData | null>(null);
  const [analysisUsage, setAnalysisUsage] = useState<UsageData | null>(null);

  const value = {
    shortName,
    setShortName,
    roleApply,
    setRoleApply,
    fileName,
    setFileName,
    languagePref,
    setLanguagePref,
    candidateData,
    setCandidateData,
    scores,
    setScores,
    conversation,
    setConversation,
    interviewUsage,
    setInterviewUsage,
    analysisUsage,
    setAnalysisUsage,
  };

  return <HContext.Provider value={value}>{children}</HContext.Provider>;
}

export function useHContext() {
  const context = useContext(HContext);
  if (context === undefined) {
    throw new Error("useHContext must be used within a HProvider");
  }
  return context;
}
