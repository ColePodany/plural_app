import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "@/components/Screen";
import { useFriends } from "../../contexts/FriendContext";

type FriendsTab = "friends" | "incoming" | "outgoing";

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const {
    friends,
    requests,
    outgoingRequests,
    acceptRequest,
    reloadFriends,
    reloadRequests,
    reloadOutgoingRequests,
  } = useFriends();

  useFocusEffect(
    useCallback(() => {
      reloadFriends();
      reloadRequests();
      reloadOutgoingRequests();
    }, [reloadFriends, reloadRequests, reloadOutgoingRequests])
  );

  return (
    <Screen style={styles.screen}>
      <Pressable
        style={[styles.addButton, { top: insets.top + 8 }]}
        onPress={() => router.push("/friend/add")}
      >
        <Ionicons name="person-add" size={18} color="white" />
      </Pressable>

      <Text style={styles.title}>Friends</Text>

      {message && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{message}</Text>
        </View>
      )}

      {/* 🔥 TABS */}
      <View style={styles.tabRow}>
        {["friends", "incoming", "outgoing"].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab as FriendsTab)}
          >
            <Text style={styles.tabText}>
              {tab === "friends"
                ? "Friends"
                : tab === "incoming"
                ? "Incoming"
                : "Sent"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ---------------- FRIENDS ---------------- */}
      {activeTab === "friends" && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friend_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No friends yet.</Text>
          }
          renderItem={({ item }) => {
            const user = item.users_public;
            const currentFronts = item.current_fronts || [];

            const frontNames = currentFronts.map((f) => f.name);

            const displayFront =
              frontNames.length > 2
                ? `${frontNames.slice(0, 2).join(", ")} +${
                    frontNames.length - 2
                  }`
                : frontNames.join(", ");

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/friend/[id]",
                    params: { id: item.friend_id },
                  })
                }
              >
                <Image
                  source={{
                    uri: user?.avatar_url || "https://placehold.co/100",
                  }}
                  style={styles.avatar}
                />

                <View style={styles.cardText}>
                  <View style={styles.topRow}>
                    <View style={styles.nameBlock}>
                      <Text style={styles.name}>
                        {user?.display_name || "No name"}
                      </Text>
                      <Text style={styles.subtext}>
                        @{user?.username || "unknown"}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#999"
                    />
                  </View>

                  <Text style={styles.frontText}>
                    Fronting:{" "}
                    {frontNames.length > 0
                      ? displayFront
                      : "No fronters"}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* ---------------- INCOMING ---------------- */}
      {activeTab === "incoming" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No requests.</Text>
          }
          renderItem={({ item }) => {
            const user = item.users_public;
            const isAccepted = acceptedIds.includes(item.id);

            return (
              <View style={styles.card}>
                <Image
                  source={{
                    uri: user?.avatar_url || "https://placehold.co/100",
                  }}
                  style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {user?.display_name || "Unknown"}
                  </Text>
                  <Text style={styles.subtext}>
                    @{user?.username || "unknown"}
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[
                        styles.acceptButton,
                        isAccepted && styles.acceptedButton,
                      ]}
                      disabled={isAccepted}
                      onPress={async () => {
                        await acceptRequest(item.id);
                        setAcceptedIds((prev) => [...prev, item.id]);
                        setMessage("Friend added!");
                        setTimeout(() => setMessage(null), 2000);
                      }}
                    >
                      <Text style={styles.buttonText}>
                        {isAccepted ? "Accepted ✓" : "Accept"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ---------------- OUTGOING ---------------- */}
      {activeTab === "outgoing" && (
        <FlatList
          data={outgoingRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No sent requests.</Text>
          }
          renderItem={({ item }) => {
            const user = item.users_public;

            return (
              <View style={styles.card}>
                <Image
                  source={{
                    uri: user?.avatar_url || "https://placehold.co/100",
                  }}
                  style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {user?.display_name || "Unknown"}
                  </Text>
                  <Text style={styles.subtext}>
                    @{user?.username || "unknown"}
                  </Text>

                  <Text style={styles.pendingText}>
                    Request sent
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },

  addButton: {
    position: "absolute",
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a90e2",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
    color: "#111",
  },

  banner: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  bannerText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },

  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  activeTab: {
    backgroundColor: "#ddd",
    borderColor: "#bbb",
  },

  tabText: {
    fontWeight: "600",
    color: "#111",
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyText: {
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
    color: "#666",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
    marginBottom: 10,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ddd",
    marginRight: 14,
  },

  cardText: { flex: 1 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nameBlock: { flex: 1 },

  name: { fontSize: 17, fontWeight: "600", color: "#111" },

  subtext: { opacity: 0.7, marginTop: 2, color: "#666" },

  frontText: { marginTop: 8, fontSize: 14, color: "#444" },

  actionRow: { marginTop: 10 },

  acceptButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  acceptedButton: {
    backgroundColor: "#2e7d32",
  },

  buttonText: { color: "white", fontWeight: "600" },

  pendingText: {
    marginTop: 8,
    color: "#888",
  },
});