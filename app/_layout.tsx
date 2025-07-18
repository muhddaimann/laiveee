import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useToggle } from "../contexts/themeContext";
import { SidebarProvider } from "../contexts/sidebarContext";
import { DemoProvider } from "../contexts/demoContext";

function InnerLayout() {
  const { theme } = useToggle();

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <DemoProvider>
          <InnerLayout />
        </DemoProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
