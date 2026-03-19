import Screen from "@/components/Screen";
import { pickAndUploadAvatar } from "@/lib/uploadAvatar";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScrollView } from "react-native";
import { useSystem } from "../../../contexts/SystemContext";

export default function EditAlterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alters, updateAlter, deleteAlter } = useSystem();

  const alter = alters.find((a) => a.id === id);

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");

  // 🔥 CUSTOM FIELDS
  const [customFields, setCustomFields] = useState<
    { label: string; value: string }[]
  >([]);

  /* ---------------- LOAD ALTER ---------------- */
  useEffect(() => {
    if (alter) {
      setName(alter.name ?? "");
      setPronouns(alter.pronouns ?? "");
      setAvatar(alter.avatar ?? "");
      setDescription(alter.description ?? "");
      setCustomFields(alter.customFields ?? []);
    }
  }, [alter]);

  /* ---------------- AVATAR ---------------- */
  const handleAvatarPress = async () => {
    const url = await pickAndUploadAvatar();
    if (url) setAvatar(url);
  };

  /* ---------------- CUSTOM FIELD LOGIC ---------------- */

  const addField = () => {
    setCustomFields((prev) => [...prev, { label: "", value: "" }]);
  };

  const updateField = (
    index: number,
    key: "label" | "value",
    text: string
  ) => {
    setCustomFields((prev) => {
      const copy = [...prev];
      copy[index][key] = text;
      return copy;
    });
  };

  const removeField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  if (!alter) {
    return (
   <Screen style={styles.screen}>
  <ScrollView contentContainerStyle={styles.scrollContent}>
    <Text style={styles.title}>Alter not found</Text>
  </ScrollView>
</Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
  <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Edit Alter</Text>

      {/* Avatar */}
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

      {/* Inputs */}
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

      {/* -------- CUSTOM FIELDS -------- */}
      <Text style={styles.sectionTitle}>Custom Fields</Text>

      {customFields.map((field, index) => (
        <View key={index} style={styles.fieldCard}>
          <TextInput
            placeholder="Label (e.g. Role)"
            value={field.label}
            onChangeText={(t) => updateField(index, "label", t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Value (e.g. Host)"
            value={field.value}
            onChangeText={(t) => updateField(index, "value", t)}
            style={styles.input}
          />

          <Pressable onPress={() => removeField(index)}>
            <Text style={{ color: "red", marginTop: 6 }}>
              Remove
            </Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addBtn} onPress={addField}>
        <Text style={styles.addText}>+ Add Field</Text>
      </Pressable>

      {/* SAVE */}
     <Pressable
  style={styles.saveButton}
  onPress={async () => {
    try {
      await updateAlter(alter.id, {
        name: name.trim(),
        pronouns: pronouns.trim(),
        avatar: avatar.trim(),
        description: description.trim(),
        customFields: customFields,
      });

      router.back();
    } catch (err) {
      console.log("UPDATE ERROR:", err);
    }
  }}
>
  <Text style={styles.saveButtonText}>Save Changes</Text>
</Pressable>

      {/* DELETE */}
      <Pressable
        style={styles.deleteButton}
        onPress={async () => {
          await deleteAlter(alter.id);
          router.replace("/(tabs)");
        }}
      >
        <Text style={styles.deleteText}>Delete Alter</Text>
      </Pressable>
        </ScrollView>
</Screen>
  );
}

/* ---------------- STYLES ---------------- */

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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
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
    marginBottom: 10,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  fieldCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  addBtn: {
    marginBottom: 10,
  },

  addText: {
    color: "#4a90e2",
    fontWeight: "600",
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

  deleteButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#b00020",
    alignItems: "center",
  },

  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  scrollContent: {
  paddingBottom: 120, // 🔥 gives space above tab bar
},
});