import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function Settings() {
  const theme = useTheme();

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View
          style={[
            styles.column,
            styles.column1,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text style={[styles.header, { color: theme.colors.primary }]}>
            Overview
          </Text>
          <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
            High-level summary of project goals, milestones, and ownership.
          </Text>
        </View>

        <View
          style={[
            styles.column,
            styles.column2,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.header, { color: theme.colors.primary }]}>
            Live Data
          </Text>
          <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
            Real-time metrics, timelines, and key updates visualized clearly.
          </Text>
        </View>

        <View
          style={[
            styles.column,
            styles.column3,
            { backgroundColor: theme.colors.secondaryContainer },
          ]}
        >
          <Text
            style={[
              styles.header,
              { color: theme.colors.onSecondaryContainer },
            ]}
          >
            Actions
          </Text>
          <Text
            style={[styles.body, { color: theme.colors.onSecondaryContainer }]}
          >
            Quick controls, shortcuts, recent changes, and interactive tools.
          </Text>
        </View>
      </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
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
