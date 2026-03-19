import Screen from "@/components/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useSystem } from "../../contexts/SystemContext";

export default function AlterDetailScreen() {
  const { id } = useLocalSearchParams();
  const { alters } = useSystem();

  const alter = alters.find((a) => String(a.id) === String(id));

  if (!alter) {
    return (
      <Screen style={styles.screen}>
        <Text>Alter not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              alter.avatar ||
              "https://placehold.co/100x100/444/FFF/png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{alter.name}</Text>

        {/* ✅ Pronouns (only if exists, like Home) */}
        {alter.pronouns ? (
          <Text style={styles.pronouns}>{alter.pronouns}</Text>
        ) : null}
      </View>

      {/* ABOUT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bodyText}>
          {alter.description || "No description yet."}
        </Text>
      </View>

      {/* -------- CUSTOM FIELDS -------- */}
{(alter.customFields ?? []).map((field, index) => (
  <View key={index} style={styles.card}>
    <Text style={styles.sectionTitle}>{field.label}</Text>
    <Text style={styles.bodyText}>
      {field.value || "No value"}
    </Text>
  </View>
))}

 {/* ✅ FOLDER DISPLAY */}
<View style={styles.card}>
  <Text style={styles.sectionTitle}>Folders</Text>

  {alter.folders.length > 0 ? (
    <View style={styles.tagContainer}>
      {alter.folders.map((folder) => (
        <View key={folder.id} style={styles.tag}>
          <Text style={styles.tagText}>{folder.name}</Text>
        </View>
      ))}
    </View>
  ) : (
    <Text style={styles.bodyText}>No folders</Text>
  )}
</View>

      {/* EDIT */}
      <Pressable
        style={styles.button}
        onPress={() => router.push(`/alter/edit/${alter.id}`)}
      >
        <Text style={styles.buttonText}>Edit Alter</Text>
      </Pressable>
    </Screen>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#555",
    marginBottom: 12,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  pronouns: {
    opacity: 0.7,
    marginTop: 4,
    color: "#666",
  },

  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },

  bodyText: {
    color: "#444",
    lineHeight: 20,
  },

  button: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#4a90e2",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  tagContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

tag: {
  backgroundColor: "#e5e5e5",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
},

tagText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#333",
},
fieldRow: {
  marginBottom: 10,
},

fieldLabel: {
  fontSize: 13,
  fontWeight: "600",
  color: "#888",
},

fieldValue: {
  fontSize: 16,
  color: "#111",
},
});