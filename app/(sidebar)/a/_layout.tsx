import { Stack } from "expo-router";

export default function LayoutA() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="LaiveConfigure" />
      <Stack.Screen name="LaiveApplicant" />
    </Stack>
  );
}
