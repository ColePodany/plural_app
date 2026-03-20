import Screen from "@/components/Screen";
import { pickAndUploadAvatar } from "@/lib/uploadAvatar";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSystem } from "../../contexts/SystemContext";

export default function NewAlterScreen() {
  const { addAlter } = useSystem();

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");

  const handleAvatarPress = async () => {
    const url = await pickAndUploadAvatar();
    if (url) setAvatar(url);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

   await addAlter({
  name: name.trim(),
  pronouns: pronouns.trim() || null,
  avatar: avatar.trim() || null,
  description: description.trim() || null,

  folders: [],          // ✅ REQUIRED
  customFields: [],     // ✅ REQUIRED
});

    router.back();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>New Alter</Text>

      {/* Avatar Picker */}
      <Pressable style={styles.avatarWrapper} onPress={handleAvatarPress}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>+</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.avatarHint}>Tap to add avatar</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      {/* Pronouns */}
      <TextInput
        style={styles.input}
        placeholder="Pronouns"
        placeholderTextColor="#888"
        value={pronouns}
        onChangeText={setPronouns}
      />

      {/* Description */}
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Save */}
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Alter</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  avatarWrapper: {
    alignItems: "center",
    marginBottom: 6,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  placeholderAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 40,
    color: "white",
    fontWeight: "600",
  },

  avatarHint: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  saveButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#444",
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});