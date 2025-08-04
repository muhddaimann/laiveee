import React, { createContext, useContext, useState } from "react";

type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  skills: string[];
  jobMatch: string;
  email: string;
  phone: string;
}

interface AlphaState {
  shortName: string | null;
  setShortName: (name: string | null) => void;
  roleApply: string | null;
  setRoleApply: (role: string | null) => void;
  languagePref: LanguagePref | null;
  setLanguagePref: (lang: LanguagePref | null) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (result: AnalysisResult | null) => void;
}

const AlphaContext = createContext<AlphaState | undefined>(undefined);

export const AlphaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shortName, setShortName] = useState<string | null>("");
  const [roleApply, setRoleApply] = useState<string | null>(
    "Customer Service Agent"
  );
  const [languagePref, setLanguagePref] = useState<LanguagePref | null>(
    "English"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  return (
    <AlphaContext.Provider
      value={{
        shortName,
        setShortName,
        roleApply,
        setRoleApply,
        languagePref,
        setLanguagePref,
        fileName,
        setFileName,
        analysis,
        setAnalysis,
      }}
    >
      {children}
    </AlphaContext.Provider>
  );
};

export const useAlphaContext = () => {
  const context = useContext(AlphaContext);
  if (!context) {
    throw new Error("useAlphaContext must be used within an AlphaProvider");
  }
  return context;
};
