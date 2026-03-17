import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "@/components/Screen";
import { useFriends } from "../../contexts/FriendContext";

type FriendsTab = "friends" | "outgoing" | "incoming";

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");
  const {
    friends,
    outgoingRequests,
    incomingRequests,
    acceptFriendRequest,
    declineFriendRequest,
  } = useFriends();

  return (
    <Screen style={styles.screen}>
      <Pressable
        style={[styles.addButton, { top: insets.top + 8 }]}
        onPress={() => router.push("/friend/add")}
      >
        <Ionicons name="person-add" size={18} color="white" />
      </Pressable>

      <Text style={styles.title}>Friends</Text>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>
            Friends
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === "outgoing" && styles.activeTab]}
          onPress={() => setActiveTab("outgoing")}
        >
          <Text style={[styles.tabText, activeTab === "outgoing" && styles.activeTabText]}>
            Outgoing
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === "incoming" && styles.activeTab]}
          onPress={() => setActiveTab("incoming")}
        >
          <Text style={[styles.tabText, activeTab === "incoming" && styles.activeTabText]}>
            Incoming
          </Text>
        </Pressable>
      </View>

      {activeTab === "friends" && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No friends yet.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/friend/${item.id}`)}
            >
              <Image
                source={{ uri: item.avatar || "https://placehold.co/100" }}
                style={styles.avatar}
              />
              <View style={styles.cardText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtext}>
                  Front: {item.currentFront?.length ? item.currentFront.join(", ") : "No one fronting"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {activeTab === "outgoing" && (
        <FlatList
          data={outgoingRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No outgoing requests.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.avatar || "https://placehold.co/100" }}
                style={styles.avatar}
              />
              <View style={styles.cardText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtext}>Request pending</Text>
              </View>
            </View>
          )}
        />
      )}

      {activeTab === "incoming" && (
        <FlatList
          data={incomingRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No incoming requests.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cardColumn}>
              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.acceptButton}
                  onPress={() => acceptFriendRequest(item.id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </Pressable>

                <Pressable
                  style={styles.declineButton}
                  onPress={() => declineFriendRequest(item.id)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
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
    borderColor: "#444",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#444",
  },
  tabText: {
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    opacity: 0.7,
    marginTop: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 10,
  },
  cardColumn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#555",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtext: {
    opacity: 0.7,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#444",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});