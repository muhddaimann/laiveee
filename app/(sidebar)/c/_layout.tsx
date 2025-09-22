import { Stack, useRouter, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../../../contexts/cAuthContext";
import { useEffect } from "react";

function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = pathname.startsWith("/c");
    if (!isAuthenticated && inAuthGroup && pathname !== "/c") {
      router.replace("/c");
    } else if (isAuthenticated && pathname === "/c") {
      router.replace("/c/dashboard");
    }
  }, [isAuthenticated, loading, pathname, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="laiveRegister" options={{ title: "LaiveRegister" }} />
      <Stack.Screen name="laiveApplicant" options={{ title: "LaiveApplicant" }} />
    </Stack>
  );
}

export default function LayoutC() {
  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  );
}
