import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { FriendProvider } from "../contexts/FriendContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { SystemProvider } from "../contexts/SystemContext";

function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="auth/index" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <SystemProvider>
            <FriendProvider>
              <AppNavigator />
            </FriendProvider>
          </SystemProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}