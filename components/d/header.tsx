import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, useTheme } from "react-native-paper";

export default function Header() {
  const theme = useTheme();

  return (
    <View
      style={[styles.wrapper, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.left}>
          <View>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Joke Generate
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Hehe
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => {}}
          contentStyle={styles.backContent}
          labelStyle={{ color: theme.colors.onPrimary }}
          buttonColor={theme.colors.primary}
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="chevron-left"
              size={size}
              color={theme.colors.onPrimary}
            />
          )}
        >
          Back
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconPill: {
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  backContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
  },
});
