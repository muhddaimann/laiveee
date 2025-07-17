import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import VoiceDemo from "../../../components/VoiceDemo";

export default function Dashboard() {
  const theme = useTheme();
  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <VoiceDemo />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
});
