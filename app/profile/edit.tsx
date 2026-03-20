import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput } from "react-native";

import Screen from "@/components/Screen";
import { pickAndUploadAvatar } from "@/lib/uploadAvatar";
import { useProfile } from "../../contexts/ProfileContext";

export default function EditProfileScreen() {
  const { profile, updateProfile } = useProfile();
  if (!profile) {
  return (
    <Screen style={styles.screen}>
      <Text style={{ textAlign: "center", marginTop: 40, opacity: 0.6 }}>
        Loading profile...
      </Text>
    </Screen>
  );
}

  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [avatar, setAvatar] = useState(profile.avatar ?? "");

  const handleAvatarPress = async () => {
    const url = await pickAndUploadAvatar();
    if (url) {
      setAvatar(url);
    }
  };

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar */}
      <Pressable onPress={handleAvatarPress}>
        <Image
          key={avatar}
          source={{
            uri: avatar || "https://placehold.co/120x120",
          }}
          style={styles.avatar}
        />
      </Pressable>

      <Text style={styles.avatarHint}>Tap to change avatar</Text>

      {/* Display Name */}
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display name"
        placeholderTextColor="#888"
      />

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        placeholderTextColor="#888"
        autoCapitalize="none"
      />

      {/* Save */}
      <Pressable
        style={styles.saveButton}
        onPress={() => {
          if (username.trim().length < 3) return;

          updateProfile({
            displayName: displayName.trim(),
            username: username.trim(),
            avatar: avatar.trim(),
          });

          router.back();
        }}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: 8,
  },

  avatarHint: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    color: "white",
  },

  saveButton: {
    marginTop: 8,
    backgroundColor: "#444",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});