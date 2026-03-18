import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { FriendProvider } from "../contexts/FriendContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { SystemProvider } from "../contexts/SystemContext";

function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f7f7",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
    <FriendProvider>
      <SystemProvider>
        <AppNavigator />
      </SystemProvider>
    </FriendProvider>
  </ProfileProvider>
</AuthProvider>
    </SafeAreaProvider>
  );
}