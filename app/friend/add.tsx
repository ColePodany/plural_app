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
import { useFriends } from "../../contexts/FriendContext";

const mockUsers = [
  { id: "1", username: "kai", displayName: "Kai", avatar: "https://placehold.co/100" },
  { id: "2", username: "moth", displayName: "Moth", avatar: "https://placehold.co/100" },
  { id: "3", username: "sol", displayName: "Sol", avatar: "https://placehold.co/100" },
  { id: "4", username: "avery", displayName: "Avery", avatar: "https://placehold.co/100" },
];

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const { sendFriendRequest, friends, outgoingRequests } = useFriends();

  const filteredUsers = mockUsers.filter((user) => {
    const q = query.toLowerCase();

    const isFriend = friends.some(
      (friend) => friend.name.toLowerCase() === user.displayName.toLowerCase()
    );
    const isOutgoing = outgoingRequests.some(
      (req) => req.name.toLowerCase() === user.displayName.toLowerCase()
    );

    if (isFriend || isOutgoing) return false;

    return (
      user.username.toLowerCase().includes(q) ||
      user.displayName.toLowerCase().includes(q)
    );
  });

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Add Friend</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search username"
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#888"
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.leftSide}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />

              <View>
                <Text style={styles.displayName}>{item.displayName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
            </View>

            <Pressable
              style={styles.addButton}
              onPress={() => sendFriendRequest(item.displayName)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    opacity: 0.7,
    marginTop: 12,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
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
    backgroundColor: "#555",
    marginRight: 12,
  },
  displayName: {
    fontSize: 17,
    fontWeight: "600",
  },
  username: {
    opacity: 0.7,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#444",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});