import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput } from "react-native";

import Screen from "@/components/Screen";
import { useProfile } from "../../contexts/ProfileContext";

export default function EditProfileScreen() {
  const { profile, updateProfile } = useProfile();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState(profile.avatar);

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Edit Profile</Text>

      <Image
        source={{ uri: avatar || "https://placehold.co/100" }}
        style={styles.avatar}
      />

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display name"
      />

      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        style={styles.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="https://..."
        autoCapitalize="none"
      />

      <Pressable
        style={styles.saveButton}
        onPress={() => {
          updateProfile({
            displayName: displayName.trim() || profile.displayName,
            avatar: avatar.trim() || "https://placehold.co/100",
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#555",
    alignSelf: "center",
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