import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useToggle } from "../contexts/themeContext";
import { SidebarProvider } from "../contexts/sidebarContext";

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
        <InnerLayout />
      </SidebarProvider>
    </ThemeProvider>
  );
}
