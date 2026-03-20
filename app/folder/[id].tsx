import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Screen from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { Image } from "react-native";
import { useSystem } from "../../contexts/SystemContext";

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alters, reloadAlters } = useSystem();

  const [folderName, setFolderName] = useState("Folder");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [emoji, setEmoji] = useState("📁");

  /* -------- LOAD FOLDER -------- */
  useEffect(() => {
    const loadFolder = async () => {
      const { data } = await supabase
        .from("alter_folders")
.select("name, emoji")
        .eq("id", id)
        .single();

   if (data) {
  setFolderName(data.name);
  setNewName(data.name);
  setEmoji(data.emoji || "📁");
}
    };

    loadFolder();
  }, [id]);

/* -------- DATA -------- */
const inFolder = alters.filter((a) =>
  (a.folders ?? []).some((f) => f.id === id)
);

const outside = alters.filter(
  (a) => !(a.folders ?? []).some((f) => f.id === id)
);

  /* -------- MOVE -------- */
  const addToFolder = async (alterId: string) => {
 await supabase.from("alter_folder_members").insert({
  alter_id: alterId,
  folder_id: id,
});
    await reloadAlters();
  };

  const removeFromFolder = async (alterId: string) => {
   await supabase
  .from("alter_folder_members")
  .delete()
  .eq("alter_id", alterId)
  .eq("folder_id", id);

    await reloadAlters();
  };

  /* -------- DELETE -------- */
  const deleteFolder = () => {
    Alert.alert(
      "Delete Folder",
      "This will NOT delete alters, just the folder.",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("alter_folders")
              .delete()
              .eq("id", id);

            router.back();
          },
        },
      ]
    );
  };

  /* -------- RENAME -------- */
  const saveName = async () => {
    await supabase
      .from("alter_folders")
.update({ name: newName, emoji })
      .eq("id", id);

    setFolderName(newName);
    setEditing(false);
  };

  return (
    <Screen style={styles.screen}>
      {/* HEADER */}
     <View style={styles.header}>
  <View style={styles.headerTop}>
   <TextInput
  value={emoji}
  onChangeText={async (val) => {
    setEmoji(val);

    await supabase
      .from("alter_folders")
      .update({ emoji: val })
      .eq("id", id);
  }}
  style={styles.emojiInput}
  maxLength={2}
/>

    {editing ? (
      <TextInput
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
      />
    ) : (
      <Text style={styles.title}>{folderName}</Text>
    )}
  </View>

  <View style={styles.headerButtons}>
    <Pressable onPress={() => setEditing((e) => !e)}>
      <Ionicons name="create-outline" size={20} />
    </Pressable>

    <Pressable onPress={saveName}>
      <Ionicons name="checkmark" size={20} />
    </Pressable>

    <Pressable onPress={deleteFolder}>
      <Ionicons name="trash" size={20} color="#d33" />
    </Pressable>

    <Pressable onPress={() => setShowPicker(true)}>
  <Ionicons name="add-circle-outline" size={22} color="#4a90e2" />
</Pressable>
  </View>
</View>

  

      {/* IN FOLDER */}
      <Text style={styles.section}>In Folder</Text>

      {inFolder.length === 0 && (
        <Text style={styles.empty}>No alters here yet</Text>
      )}

    <FlatList
  data={inFolder}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowLeft}>
        <Image
          source={{ uri: item.avatar || "https://placehold.co/100" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name}</Text>
      </View>

      <Pressable
        style={styles.removeBtn}
        onPress={() => removeFromFolder(item.id)}
      >
        <Ionicons name="remove" size={16} color="white" />
      </Pressable>
    </View>
  )}
/>


      {/* -------- ADD MODAL -------- */}
      <Modal visible={showPicker} animationType="slide">
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Alters</Text>

            <Pressable onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} />
            </Pressable>
          </View>

          <FlatList
            data={outside}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={async () => {
                  await addToFolder(item.id);
                }}
              >
               <View style={styles.rowLeft}>
  <Image
    source={{ uri: item.avatar || "https://placehold.co/100" }}
    style={styles.avatar}
  />
  <Text style={styles.name}>{item.name}</Text>
</View>

                <Ionicons name="add" size={18} color="#4a90e2" />
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },

  header: {
    marginBottom: 16,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  addText: {
    color: "#4a90e2",
    fontWeight: "600",
  },

  section: {
    marginBottom: 8, // 🔥 FIXED spacing
    fontWeight: "600",
    fontSize: 16,
  },

  empty: {
    opacity: 0.6,
    marginBottom: 10,
  },

card: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  borderRadius: 16,
  backgroundColor: "#fff",
  marginBottom: 10,

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},

  name: {
    fontSize: 16,
    fontWeight: "500",
  },

  removeBtn: {
    backgroundColor: "#d33",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  /* -------- MODAL -------- */

  modalScreen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerTop: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
},

emojiInput: {
  fontSize: 28,
  width: 40,
  textAlign: "center",
},

addButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#4a90e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 16,
},

addButtonText: {
  color: "white",
  fontWeight: "600",
  marginLeft: 6,
},
rowLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

avatar: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#ddd",
},
});