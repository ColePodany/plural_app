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
  const [sentIds, setSentIds] = useState<string[]>([]); // ✅ track sent

  const { sendRequest, friends, requests } = useFriends();

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

  // 🚫 Filter existing
  const filteredUsers = results.filter((user) => {
    const isFriend = friends.some(
      (f) => f.friend_id === user.user_id
    );

    const isOutgoing = requests.some(
      (r) => r.receiver_id === user.user_id
    );

    return !isFriend && !isOutgoing;
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
          const isSent = sentIds.includes(item.user_id);

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

              <Pressable
                style={[
                  styles.addButton,
                  isSent && styles.sentButton,
                ]}
                disabled={isSent}
                onPress={async () => {
                  const success = await sendRequest(item.username);

                  if (success) {
                    setSentIds((prev) => [...prev, item.user_id]);

                    // optional: remove from list instantly
                    setResults((prev) =>
                      prev.filter((u) => u.user_id !== item.user_id)
                    );
                  }
                }}
              >
                <Text style={styles.addButtonText}>
                  {isSent ? "Sent ✓" : "Add"}
                </Text>
              </Pressable>
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
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});