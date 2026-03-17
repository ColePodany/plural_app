import Screen from "@/components/Screen";
import { pickAndUploadAvatar } from "@/lib/uploadAvatar";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput } from "react-native";

import { useSystem } from "../../../contexts/SystemContext";

export default function EditAlterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alters, updateAlter } = useSystem();

  const alter = alters.find((a) => a.id === id);

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (alter) {
      setName(alter.name ?? "");
      setPronouns(alter.pronouns ?? "");
      setAvatar(alter.avatar ?? "");
      setDescription(alter.description ?? "");
    }
  }, [alter]);

  const handleAvatarPress = async () => {
    const url = await pickAndUploadAvatar();
    if (url) setAvatar(url);
  };

  if (!alter) {
    return (
      <Screen style={styles.screen}>
        <Text style={styles.title}>Alter not found</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Edit Alter</Text>

      {/* Clickable Avatar */}
      <Pressable onPress={handleAvatarPress}>
       <Image
  key={avatar}
  source={{
    uri: avatar || "https://placehold.co/100x100",
  }}
  style={styles.avatar}
/>
      </Pressable>

      <Text style={styles.avatarHint}>Tap avatar to change</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Pronouns"
        value={pronouns}
        onChangeText={setPronouns}
      />

      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable
        style={styles.saveButton}
        onPress={() => {
          updateAlter(alter.id, {
            name: name.trim(),
            pronouns: pronouns.trim(),
            avatar: avatar.trim(),
            description: description.trim(),
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
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: 8,
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
    marginBottom: 14,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
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