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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "@/components/Screen";
import { useSystem } from "../../contexts/SystemContext";

/* ------------------ TYPES ------------------ */
type HeaderItem = {
  type: "header";
  title: string;
};

type AlterItem = {
  type: "fronter" | "member";
  id: string;
  name: string;
  pronouns?: string;
  avatar?: string;
  description?: string;
};

type ListItem = HeaderItem | AlterItem;

/* ------------------ MEMO CARD ------------------ */
const AlterCard = React.memo(
  ({
    item,
    isFronting,
    onToggle,
  }: {
    item: AlterItem;
    isFronting: boolean;
    onToggle: () => void;
  }) => {
    return (
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
              uri:
                item.avatar ||
                "https://placehold.co/100x100/444/FFF/png",
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
  }
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

  const fronters = useMemo(
    () => alters.filter((a) => currentFrontIds.includes(String(a.id))),
    [alters, currentFrontIds]
  );

  const nonFronters = useMemo(
    () => alters.filter((a) => !currentFrontIds.includes(String(a.id))),
    [alters, currentFrontIds]
  );

  const combined: ListItem[] = useMemo(() => {
    return [
      { type: "header", title: "Current Fronters" },
      ...fronters.map((a) => ({
        type: "fronter" as const,
        id: String(a.id),
        name: a.name,
        pronouns: a.pronouns,
        avatar: a.avatar,
        description: a.description,
      })),
      { type: "header", title: "All Members" },
      ...nonFronters.map((a) => ({
        type: "member" as const,
        id: String(a.id),
        name: a.name,
        pronouns: a.pronouns,
        avatar: a.avatar,
        description: a.description,
      })),
    ];
  }, [fronters, nonFronters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reloadAlters(), reloadFrontStatus()]);
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return <Text style={styles.heading}>{item.title}</Text>;
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
    [currentFrontIds, toggleFront]
  );

  return (
    <Screen style={styles.screen}>
      <Pressable
        style={[styles.addButton, { top: insets.top + 8 }]}
        onPress={() => router.push("/alter/new")}
      >
        <Ionicons name="add" size={20} color="white" />
      </Pressable>

      <FlatList
        data={combined}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${index}` : item.id
        }
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
      />
    </Screen>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    padding: 16,
    paddingTop: 56,
    paddingBottom: 40,
  },

  addButton: {
    position: "absolute",
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
  },

  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#555",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#666",
  },

  cardText: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  pronouns: {
    opacity: 0.7,
    marginTop: 2,
  },

  frontToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  frontActive: {
    backgroundColor: "#d14",
  },
});