import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlphaAnalysis {
  fullName: string;
  relatedLink: string;
  summary: string;
  strength: string[];
  jobMatch: string;
  candidateEmail: string;
  candidatePhone: string;
}

interface AlphaState {
  phase: 'welcome' | 'analyzing' | 'report';
  fileName: string | null;
  shortName: string | null;
  roleApply: string | null;
  analysis: AlphaAnalysis | null;
  setPhase: (phase: 'welcome' | 'analyzing' | 'report') => void;
  setFileName: (fileName: string | null) => void;
  setShortName: (name: string | null) => void;
  setRoleApply: (role: string | null) => void;
  setAnalysis: (analysis: AlphaAnalysis | null) => void;
  restart: () => void;
}

const AlphaContext = createContext<AlphaState | undefined>(undefined);

export const AlphaProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<'welcome' | 'analyzing' | 'report'>('welcome');
  const [fileName, setFileName] = useState<string | null>(null);
  const [shortName, setShortName] = useState<string | null>(null);
  const [roleApply, setRoleApply] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AlphaAnalysis | null>(null);

  const restart = () => {
    setPhase('welcome');
    setFileName(null);
    setShortName(null);
    setRoleApply(null);
    setAnalysis(null);
  };

  return (
    <AlphaContext.Provider value={{ 
      phase, 
      fileName, 
      shortName, 
      roleApply, 
      analysis, 
      setPhase, 
      setFileName, 
      setShortName, 
      setRoleApply, 
      setAnalysis,
      restart
    }}>
      {children}
    </AlphaContext.Provider>
  );
};

export const useAlphaContext = () => {
  const context = useContext(AlphaContext);
  if (context === undefined) {
    throw new Error('useAlphaContext must be used within an AlphaProvider');
  }
  return context;
};
