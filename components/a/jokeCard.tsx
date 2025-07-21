import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { useRouter } from "expo-router";

const minHeight = Dimensions.get("window").height / 4;

export default function JokeCard() {
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
          Joke Generator
        </Text>
        <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
          Instantly generate witty, light-hearted jokes with a tap. Great for
          icebreakers, daily laughs or just to brighten your day. Powered
          by AI with a sense of humor.
        </Text>
      </View>
      <Button
        mode="text"
        onPress={() => router.push("/joke")}
        textColor={theme.colors.primary}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Make me laugh
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
