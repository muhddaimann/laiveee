import React, { createContext, useState, useContext, ReactNode } from "react";

interface SkillMatch {
  name: string;
  justification: string;
}

interface ExperienceMatch {
  area: string;
  justification: string;
}

interface RoleFit {
  trait: string;
  justification: string;
}

interface CandidateData {
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
  roleFit: RoleFit[];
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