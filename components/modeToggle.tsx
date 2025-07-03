import React from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useToggle } from "../contexts/themeContext";

export default function ModeToggle() {
  const { isDarkMode, toggleTheme } = useToggle();
  const theme = useTheme();

  return (
    <View style={{ position: "absolute", top: 16, right: 16 }}>
      <Pressable onPress={toggleTheme}>
        <MaterialCommunityIcons
          name={isDarkMode ? "weather-sunny" : "moon-waning-crescent"}
          size={20}
          color={isDarkMode ? theme.colors.primary : theme.colors.secondary}
        />
      </Pressable>
    </View>
  );
}
