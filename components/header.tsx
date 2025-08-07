import React from "react";
import { StyleSheet } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export default function Header({ title, actions }: HeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header
      style={[styles.header, { backgroundColor: theme.colors.surface }]}
      elevated
    >
      <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
      {actions}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
