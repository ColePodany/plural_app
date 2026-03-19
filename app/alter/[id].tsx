import Screen from "@/components/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { useSystem } from "../../contexts/SystemContext";

export default function AlterDetailScreen() {
  const { id } = useLocalSearchParams();
  const { alters, reloadAlters } = useSystem();

  const alter = alters.find((a) => String(a.id) === String(id));

  const [folders, setFolders] = useState<any[]>([]);
  const [choosingFolder, setChoosingFolder] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------- LOAD FOLDERS -------- */
  useEffect(() => {
    const loadFolders = async () => {
      const { data, error } = await supabase
        .from("alter_folders")
        .select("*")
        .order("created_at");

      if (error) {
        console.log("FOLDER LOAD ERROR:", error);
      }

      setFolders(data || []);
    };

    loadFolders();
  }, []);

  /* -------- MOVE TO FOLDER -------- */
  const moveToFolder = async (folderId: string | null) => {
    if (!alter?.id) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ folder_id: folderId })
      .eq("id", alter.id);

    if (error) {
      console.log("MOVE ERROR:", error);
      setLoading(false);
      return;
    }

    await reloadAlters();

    setChoosingFolder(false);
    setLoading(false);
  };

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
        <Text style={styles.pronouns}>{alter.pronouns}</Text>
      </View>

      {/* ABOUT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text>{alter.description || "No description yet."}</Text>
      </View>

      {/* -------- FOLDER SECTION -------- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Folder</Text>

        {/* CURRENT */}
        <Pressable
          style={styles.currentFolder}
          onPress={() => setChoosingFolder((prev) => !prev)}
        >
          <Text>
            {alter.alter_folders?.name || "No folder"} (tap to change)
          </Text>
        </Pressable>

        {/* SELECTOR */}
        {choosingFolder && (
          <View style={{ marginTop: 12 }}>
            <Pressable
              style={styles.folderOption}
              onPress={() => moveToFolder(null)}
            >
              <Text>No Folder</Text>
            </Pressable>

            {folders.map((folder) => (
              <Pressable
                key={folder.id}
                style={styles.folderOption}
                onPress={() => moveToFolder(folder.id)}
              >
                <Text>📁 {folder.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {loading && (
          <Text style={{ marginTop: 8, opacity: 0.6 }}>
            Updating...
          </Text>
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
  },

  pronouns: {
    opacity: 0.7,
    marginTop: 4,
  },

  card: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  currentFolder: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
  },

  folderOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 6,
  },

  button: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#444",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});