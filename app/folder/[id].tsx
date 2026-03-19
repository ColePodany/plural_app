import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Screen from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { useSystem } from "../../contexts/SystemContext";

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alters, reloadAlters } = useSystem();

  const [loading, setLoading] = useState(false);

  /* -------- SPLIT DATA -------- */
  const inFolder = alters.filter((a) => a.folder_id === id);
  const outside = alters.filter((a) => a.folder_id !== id);

  /* -------- ADD TO FOLDER -------- */
  const addToFolder = async (alterId: string) => {
    setLoading(true);

    await supabase
      .from("profiles")
      .update({ folder_id: id })
      .eq("id", alterId);

    await reloadAlters();
    setLoading(false);
  };

  /* -------- REMOVE FROM FOLDER -------- */
  const removeFromFolder = async (alterId: string) => {
    setLoading(true);

    await supabase
      .from("profiles")
      .update({ folder_id: null })
      .eq("id", alterId);

    await reloadAlters();
    setLoading(false);
  };

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Folder</Text>

      {/* -------- IN FOLDER -------- */}
      <Text style={styles.section}>In Folder</Text>
      <FlatList
        data={inFolder}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>

            <Pressable
              style={styles.removeBtn}
              onPress={() => removeFromFolder(item.id)}
            >
              <Text style={styles.btnText}>Remove</Text>
            </Pressable>
          </View>
        )}
      />

      {/* -------- ADD TO FOLDER -------- */}
      <Text style={styles.section}>Add Alters</Text>
      <FlatList
        data={outside}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>

            <Pressable
              style={styles.addBtn}
              onPress={() => addToFolder(item.id)}
            >
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    marginBottom: 8,
  },

  addBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  removeBtn: {
    backgroundColor: "#a33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  btnText: {
    color: "white",
    fontWeight: "600",
  },
});