
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ResumeData {
  fullName: string;
  candidateEmail: string;
  candidatePhone: string;
  relatedLinks: string[];
  professionalSummary: string;
  jobMatch: number;
  longStrength: string;
  shortStrength: string;
}

interface ResumeContextType {
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData | null) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResumeContext must be used within a ResumeProvider");
  }
  return context;
};
