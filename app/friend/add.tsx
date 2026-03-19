import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Screen from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { useFriends } from "../../contexts/FriendContext";

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const { sendRequest, friends, requests, outgoingRequests } =
    useFriends();

  // 🔍 Search users
  const searchUsers = async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("users_public")
      .select("*")
      .ilike("username", `%${text}%`)
      .limit(10);

    if (error) {
      console.log("SEARCH ERROR:", error);
      return;
    }

    setResults(data || []);
  };

  // 🚫 Filter + status logic
  const filteredUsers = results.map((user) => {
    const isFriend = friends.some(
      (f) => f.friend_id === user.user_id
    );

    const isIncoming = requests.some(
      (r) => r.user_id === user.user_id
    );

    const isOutgoing = outgoingRequests.some(
      (r) => r.user_id === user.user_id
    );

    return {
      ...user,
      status: isFriend
        ? "friend"
        : isIncoming
        ? "incoming"
        : isOutgoing
        ? "outgoing"
        : "none",
    };
  });

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Add Friend</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search username"
        value={query}
        onChangeText={searchUsers}
        placeholderTextColor="#888"
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found.</Text>
        }
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <View style={styles.leftSide}>
                <Image
                  source={{
                    uri: item.avatar_url || "https://placehold.co/100",
                  }}
                  style={styles.avatar}
                />

                <View>
                  <Text style={styles.displayName}>
                    {item.display_name || "No name"}
                  </Text>
                  <Text style={styles.username}>
                    @{item.username}
                  </Text>
                </View>
              </View>

              {/* 🔥 BUTTON STATES */}
              {item.status === "friend" && (
                <View style={styles.disabledButton}>
                  <Text style={styles.disabledText}>Friends</Text>
                </View>
              )}

              {item.status === "incoming" && (
                <View style={styles.pendingButton}>
                  <Text style={styles.pendingText}>Incoming</Text>
                </View>
              )}

              {item.status === "outgoing" && (
                <View style={styles.sentButton}>
                  <Text style={styles.addButtonText}>Sent ✓</Text>
                </View>
              )}

              {item.status === "none" && (
                <Pressable
                  style={styles.addButton}
                  onPress={async () => {
                    const success = await sendRequest(item.username);

                    if (success) {
                      // instantly reflect UI
                      setResults((prev) =>
                        prev.map((u) =>
                          u.user_id === item.user_id
                            ? { ...u, status: "outgoing" }
                            : u
                        )
                      );
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#111",
    backgroundColor: "#fff",
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ddd",
    marginRight: 12,
  },

  displayName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  username: {
    opacity: 0.7,
    marginTop: 2,
    color: "#666",
  },

  addButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  sentButton: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  pendingButton: {
    backgroundColor: "#aaa",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  disabledButton: {
    backgroundColor: "#ccc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
  },

  pendingText: {
    color: "white",
    fontWeight: "600",
  },

  disabledText: {
    color: "#555",
    fontWeight: "600",
  },
});