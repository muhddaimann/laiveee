import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import ColumnA from "../../../components/a/columnA";
import ColumnB from "../../../components/a/columnB";
import ColumnC from "../../../components/a/columnC";

export default function Home() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.column}>
        <ColumnA />
      </View>
      <View style={styles.column}>
        <ColumnB />
      </View>
      <View style={styles.column}>
        <ColumnC />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: "100%",
    paddingHorizontal: 24,
    gap: 24,
  },
  column: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
