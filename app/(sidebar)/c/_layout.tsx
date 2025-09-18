
import { Stack, useRouter, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../../../contexts/authContext";
import { useEffect } from "react";

/**
 * This component handles the routing logic based on authentication state.
 */
function AuthLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't route until the auth state is loaded
    if (loading) {
      return;
    }

    const inAuthGroup = pathname.startsWith("/c");

    // If the user is not logged in and is in a protected part of the app,
    // redirect to the login page.
    if (!user && inAuthGroup && pathname !== "/c") {
      router.replace("/c");
    }
    // If the user is logged in and on the login page,
    // redirect to the dashboard.
    else if (user && pathname === "/c") {
      router.replace("/c/dashboard");
    }
  }, [user, loading, pathname, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
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
