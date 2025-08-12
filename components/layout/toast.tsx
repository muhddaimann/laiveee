import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Animated, ViewStyle } from "react-native";
import { useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
  style?: ViewStyle;
};

const ICONS: Record<ToastType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  success: "check-circle-outline",
  error: "alert-circle-outline",
  info: "information-outline",
};

export default function Toast({
  message,
  type,
  duration = 3000,
  onHide,
  style,
}: ToastProps) {
  const theme = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(onHide);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, fadeAnim, onHide]);

  const backgroundColor = {
    success: theme.colors.tertiary,
    error: theme.colors.error,
    info: theme.colors.secondary,
  }[type];

  const onColor = {
    success: theme.colors.onTertiary,
    error: theme.colors.onError,
    info: theme.colors.onSecondary,
  }[type];

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }, style]}>
      <Surface style={[styles.container, { backgroundColor }]} elevation={4}>
        <MaterialCommunityIcons name={ICONS[type]} size={22} color={onColor} />
        <Text style={[styles.message, { color: onColor }]}>{message}</Text>
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: "flex-end",
    marginTop: 8,
    maxWidth: 360,
    width: 320,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
});
