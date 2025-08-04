import React, { createContext, useContext, useState } from "react";
import { UsageData } from "../utils/costEstimator";

type LanguagePref = "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";

interface BetaState {
  scores: any | null;
  setScores: (scores: any | null) => void;
  shortName: string | null;
  setShortName: (shortName: string | null) => void;
  roleApply: string | null;
  setRoleApply: (roleApply: string | null) => void;
  languagePref: LanguagePref | null;
  setLanguagePref: (languagePref: LanguagePref | null) => void;
  usage: UsageData | null;
  setUsage: (usage: UsageData | null) => void;
}

const BetaContext = createContext<BetaState | undefined>(undefined);

export const BetaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scores, setScores] = useState<any | null>(null);
  const [shortName, setShortName] = useState<string | null>(null);
  const [roleApply, setRoleApply] = useState<string | null>(null);
  const [languagePref, setLanguagePref] = useState<LanguagePref | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);

  return (
    <BetaContext.Provider
      value={{
        scores,
        setScores,
        shortName,
        setShortName,
        roleApply,
        setRoleApply,
        languagePref,
        setLanguagePref,
        usage,
        setUsage,
      }}
    >
      {children}
    </BetaContext.Provider>
  );
};

export const useBetaContext = () => {
  const context = useContext(BetaContext);
  if (!context) {
    throw new Error("useBetaContext must be used within a BetaProvider");
  }
  return context;
};
