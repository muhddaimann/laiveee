import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function LayoutE() {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "LaiveRecruit™",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      />
      <Stack.Screen
        name="LaiveConfigure"
        options={{
          headerTitle: "Configure Laive",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      />
      <Stack.Screen
        name="LaiveApplicant"
        options={{
          headerTitle: "Applicant Details",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      />
    </Stack>
  );
}
