import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Screen from "@/components/Screen";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";

export default function ProfileScreen() {
  const { session } = useAuth();
  const { profile, loading } = useProfile();

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen style={styles.center}>
        <Text>No profile found.</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Image
          source={{ uri: profile.avatar || "https://placehold.co/100" }}
          style={styles.avatar}
        />

        <Text style={styles.displayName}>{profile.displayName || "No name"}</Text>
        <Text style={styles.username}>@{profile.username || "unknown"}</Text>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/profile/edit")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Pressable style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
        </Pressable>

        <Pressable style={styles.row}>
          <Text style={styles.rowText}>Privacy</Text>
        </Pressable>

        <Pressable style={styles.row}>
          <Text style={styles.rowText}>App Theme</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.log("SIGN OUT ERROR:", error);
            return;
          }

          router.replace("/auth");
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#555",
    marginBottom: 12,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
  },
  username: {
    opacity: 0.7,
    marginBottom: 12,
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: "#aa4444",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#aa4444",
    fontWeight: "600",
  },
});