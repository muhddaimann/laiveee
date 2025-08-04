import { Stack } from "expo-router";

export default function LayoutH() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
