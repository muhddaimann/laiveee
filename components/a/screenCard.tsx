import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { useRouter } from "expo-router";

const minHeight = Dimensions.get("window").height / 4;

export default function ScreenCard() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, minHeight },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Interview Simulation
        </Text>
        <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
          Practice your customer service skills with a live AI interview. Speak
          freely and receive intelligent, real-time feedback from Laive.
        </Text>
      </View>
      <Button
        mode="text"
        onPress={() => router.push("/c")}
        textColor={theme.colors.primary}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Try now
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 32,
    paddingBottom: 16,
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
    elevation: 0,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  button: {
    borderRadius: 100,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  buttonContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
});
