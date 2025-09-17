import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useToggle } from "../contexts/themeContext";
import { SidebarProvider } from "../contexts/sidebarContext";
import { NotificationProvider } from "../contexts/notificationContext";

function AppWithTheme() {
  const { theme } = useToggle();

  return (
    <PaperProvider theme={theme}>
      <NotificationProvider>
        <SidebarProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </SidebarProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}
