import React, { createContext, useContext, useState } from "react";

interface InterviewState {
  scores: any | null;
  setScores: (scores: any | null) => void;
}

const InterviewContext = createContext<InterviewState | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scores, setScores] = useState<any | null>(null);

  return (
    <InterviewContext.Provider value={{ scores, setScores }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterviewContext must be used within an InterviewProvider");
  }
  return context;
};
