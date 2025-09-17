import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = true }: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {showBack && (
        <Button
          mode="contained"
          icon="chevron-left"
          onPress={router.back}
          contentStyle={{ flexDirection: "row-reverse" }}
          labelStyle={{ fontWeight: "500" }}
        >
          Back
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    width: "100%",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
