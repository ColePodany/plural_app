import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useSystem } from "../../contexts/SystemContext";

/* ------------------ TYPES ------------------ */
type FolderItem = {
  type: "folder";
  id: string;
  name: string;
  emoji?: string; 
};

type AlterItem = {
  type: "alter";
  id: string;
  name: string;
  pronouns?: string;
  avatar?: string;
};

type HeaderItem = {
  type: "header";
  title: string;
};

type ListItem = FolderItem | AlterItem | HeaderItem;

/* ------------------ ALTER CARD ------------------ */
const AlterCard = ({
  item,
  isFronting,
  onToggle,
}: {
  item: AlterItem;
  isFronting: boolean;
  onToggle: () => void;
}) => (
  <View style={styles.card}>
    <Pressable
      style={styles.cardMain}
      onPress={() =>
        router.push({
          pathname: "/alter/[id]",
          params: { id: item.id },
        })
      }
    >
      <Image
        source={{
          uri: item.avatar || "https://placehold.co/100x100",
        }}
        style={styles.avatar}
      />

      <View style={styles.cardText}>
        <Text style={styles.name}>{item.name}</Text>
        {!!item.pronouns && (
          <Text style={styles.pronouns}>{item.pronouns}</Text>
        )}
      </View>
    </Pressable>

    <Pressable
      style={[
        styles.frontToggle,
        isFronting && styles.frontActive,
      ]}
      onPress={onToggle}
    >
      <Ionicons
        name={isFronting ? "remove" : "add"}
        size={18}
        color="white"
      />
    </Pressable>
  </View>
);

/* ------------------ FOLDER CARD ------------------ */
const FolderCard = ({ item }: { item: FolderItem }) => (
  <Pressable
    style={styles.folderCard}
    onPress={() =>
      router.push({
        pathname: "/folder/[id]",
        params: { id: item.id },
      })
    }
  >
<Text style={{ fontSize: 20, marginRight: 4 }}>
        {item.emoji || "📁"}
    </Text>

    <Text style={styles.folderText}>{item.name}</Text>
  </Pressable>
);

/* ------------------ SCREEN ------------------ */
export default function HomeScreen() {
  const {
    alters,
    currentFrontIds,
    toggleFront,
    reloadAlters,
    reloadFrontStatus,
  } = useSystem();

  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
const [folders, setFolders] = useState<any[]>([]);

useFocusEffect(
  useCallback(() => {
    const loadFolders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("alter_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");

      if (error) {
        console.log("LOAD FOLDERS ERROR:", error);
        return;
      }

      setFolders(data || []);
    };

    loadFolders();
  }, [])
);

  /* -------- CREATE FOLDER -------- */
  const createFolder = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("alter_folders").insert({
    name: newFolderName,
    user_id: user.id,
  });

  if (error) {
    console.log("CREATE FOLDER ERROR:", error);
    return;
  }

  setCreatingFolder(false);
  setNewFolderName("");

  // ✅ reload folders properly
  const { data } = await supabase
    .from("alter_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  setFolders(data || []);
};

  /* -------- DATA SPLIT -------- */
  const fronters = useMemo(
    () => alters.filter((a) => currentFrontIds.includes(a.id)),
    [alters, currentFrontIds]
  );

const ungrouped = alters.filter(
  (a) => !currentFrontIds.includes(a.id)
);
  /* -------- BUILD LIST -------- */
 const combined: ListItem[] = useMemo(() => {
  const list: ListItem[] = [];

  // 🔥 FOLDERS FIRST
  list.push({ type: "header", title: "Folders" });
  folders.forEach((f: any) =>
    list.push({
      type: "folder",
      id: f.id,
      name: f.name,
          emoji: f.emoji,
    })
  );

  // 🔥 FRONTERS SECOND
  list.push({ type: "header", title: "Fronters" });
 fronters.forEach((a) =>
  list.push({
    type: "alter",
    id: a.id,
    name: a.name,
    pronouns: a.pronouns ?? undefined,
    avatar: a.avatar ?? undefined,
  })
);

  // 🔥 OTHERS LAST
  list.push({ type: "header", title: "Others" });
  ungrouped.forEach((a) =>
  list.push({
    type: "alter",
    id: a.id,
    name: a.name,
    pronouns: a.pronouns ?? undefined,
    avatar: a.avatar ?? undefined,
  })
);
  return list;
}, [folders, fronters, ungrouped]);

  /* -------- REFRESH -------- */
 const handleRefresh = async () => {
  setRefreshing(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("alter_folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    setFolders(data || []);
  }

  await Promise.all([reloadAlters(), reloadFrontStatus()]);

  setRefreshing(false);
};

  /* -------- RENDER -------- */
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return <Text style={styles.heading}>{item.title}</Text>;
      }

      if (item.type === "folder") {
        return <FolderCard item={item} />;
      }

      const isFronting = currentFrontIds.includes(item.id);

      return (
        <AlterCard
          item={item}
          isFronting={isFronting}
          onToggle={() => toggleFront(item.id)}
        />
      );
    },
    [currentFrontIds]
  );

  return (
    <Screen style={styles.screen}>
      {/* BUTTONS */}
      <View style={[styles.topButtons, { top: insets.top + 8 }]}>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.push("/alter/new")}
        >
          <Ionicons name="add" size={20} color="white" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => setCreatingFolder(true)}
        >
          <Ionicons name="folder" size={18} color="white" />
        </Pressable>
      </View>

      {/* MODAL */}
      {creatingFolder && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TextInput
              placeholder="Folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              style={styles.input}
            />

            <Pressable style={styles.modalBtn} onPress={createFolder}>
              <Text style={styles.modalBtnText}>Create</Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={combined}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </Screen>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({

  cardText: {
  flex: 1,
  justifyContent: "center",
},
  screen: { flex: 1 },

  container: { padding: 16, paddingTop: 56 },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 10,
  },

  folderText: {
    fontSize: 16,
    fontWeight: "600",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    marginBottom: 10,
  },

  cardMain: {
    flex: 1,
    flexDirection: "row",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  name: { fontSize: 16, fontWeight: "600" },

  pronouns: { opacity: 0.6 },

  frontToggle: {
    width: 30,
    height: 30,
    backgroundColor: "#444",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  frontActive: {
    backgroundColor: "#d14",
  },

  topButtons: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },

modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  backgroundColor: "rgba(0,0,0,0.4)",

  justifyContent: "center",
  alignItems: "center",

  zIndex: 999,        // 🔥 IMPORTANT
  elevation: 999,     // 🔥 ANDROID FIX
},

modal: {
  width: "80%",
  backgroundColor: "#fff", // 🔥 LIGHT
  padding: 20,
  borderRadius: 12,
},

 modalBtn: {
  backgroundColor: "#4a90e2",
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 10,
},

  modalBtnText: {
  color: "white",
  fontWeight: "600",
},

 input: {
  borderWidth: 1,
  borderColor: "#ddd",
  padding: 10,
  borderRadius: 10,
  backgroundColor: "#f9f9f9",
},
});