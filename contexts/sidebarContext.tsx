import React, { createContext, useContext, useState } from 'react';

type SidebarState = {
  isVisible: boolean;
  isExpanded: boolean;
  disableNavigation: boolean;
  toggleVisibility: () => void;
  toggleExpand: () => void;
  setDisableNavigation: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarState | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [disableNavigation, setDisableNavigation] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{ isVisible, isExpanded, disableNavigation, toggleVisibility, toggleExpand, setDisableNavigation }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
};
