import { Stack } from "expo-router";

export default function LayoutD() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[token]" />
    </Stack>
  );
}
