import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function ColumnA() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.topCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Laive Voicebot
        </Text>
        <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
          Your AI assistant for real-time voice interaction.
        </Text>
      </View>
      <View
        style={[styles.bottomCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.about, { color: theme.colors.onSurface }]}>
          Created by Web & AI Team
        </Text>
        <Text style={[styles.stack, { color: theme.colors.onSurfaceVariant }]}>
          ├─ Tech Stack{"\n"}│ ├─ Frontend: Expo React Native Web with
          TypeScript{"\n"}│ ├─ Backend: FastAPI{"\n"}│ ├─ AI: OpenAI GPT-4o
          Realtime{"\n"}│ ├─ RAG: Chroma Vector DB{"\n"}│ └─ Hosting: EAS
          Hosting*
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    paddingVertical: 32,
    width: "100%",
    gap: 16,
  },
  topCard: {
    flex: 7,
    borderRadius: 16,
    padding: 24,
    justifyContent: "center",
  },
  bottomCard: {
    flex: 3,
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
  },
  about: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  stack: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "monospace",
  },
});
