import Screen from "@/components/Screen";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useSystem } from "../../contexts/SystemContext";

export default function NewAlterScreen() {
  const { addAlter } = useSystem();

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>New Alter</Text>

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
        style={styles.input}
        placeholder="Avatar URL"
        value={avatar}
        onChangeText={setAvatar}
      />

      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable
        style={styles.button}
        onPress={() => {
          if (!name.trim()) return;

          addAlter({
            name: name.trim(),
            pronouns: pronouns.trim(),
            avatar: avatar.trim(),
            description: description.trim(),
          });

          router.back();
        }}
      >
        <Text style={styles.buttonText}>Save Alter</Text>
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
    marginBottom: 16,
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
  button: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#444",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});