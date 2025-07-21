import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function JokeHeader() {
  const theme = useTheme();

  return (
    <View
      style={[styles.wrapper, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.row}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Joke Generator
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
