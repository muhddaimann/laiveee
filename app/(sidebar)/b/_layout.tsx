import { Stack } from "expo-router";

export default function LayoutA() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
