import React, { createContext, useState, useContext, ReactNode } from "react";
import useDemo from "../hooks/useDemo";

interface DemoContextType {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  getProjectLabel: (value: string) => string;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const { options } = useDemo();
  const [selectedProject, setSelectedProject] = useState("general");

  const getProjectLabel = (value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : "Select Project";
  };

  return (
    <DemoContext.Provider
      value={{ selectedProject, setSelectedProject, getProjectLabel }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemoContext must be used within a DemoProvider");
  }
  return context;
};
