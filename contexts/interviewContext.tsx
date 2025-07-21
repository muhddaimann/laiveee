import React, { createContext, useContext, useState } from "react";

type Language = "Malay" | "Mandarin" | "Korean" | "Japanese";

interface InterviewState {
  scores: any | null;
  setScores: (scores: any | null) => void;
  language: Language | null;
  setLanguage: (language: Language | null) => void;
}

const InterviewContext = createContext<InterviewState | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scores, setScores] = useState<any | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);

  return (
    <InterviewContext.Provider
      value={{ scores, setScores, language, setLanguage }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error(
      "useInterviewContext must be used within an InterviewProvider"
    );
  }
  return context;
};
