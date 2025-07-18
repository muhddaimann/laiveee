import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function Home() {
  const theme = useTheme();

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>

    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
    padding: 20,
  },
  column: {
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-between",
    elevation: 2,
  },
  column1: {
    flex: 1,
  },
  column2: {
    flex: 2,
  },
  column3: {
    flex: 3,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
});
