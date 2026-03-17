import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FriendProvider } from "./contexts/FriendContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { SystemProvider } from "./contexts/SystemContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <SystemProvider>
          <FriendProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </FriendProvider>
        </SystemProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}