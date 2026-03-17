import Screen from "@/components/Screen";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const friendSystems = {
  "1": {
    name: "Kai",
    avatar: "https://placehold.co/100",
    fronters: ["Ash", "Luna"],
    members: [
      { id: "a", name: "Ash", pronouns: "he/they" },
      { id: "b", name: "Luna", pronouns: "she/her" },
      { id: "c", name: "Milo", pronouns: "he/him" },
    ],
  },
  "2": {
    name: "Moth",
    avatar: "https://placehold.co/100",
    fronters: ["Vox"],
    members: [
      { id: "d", name: "Vox", pronouns: "they/them" },
      { id: "e", name: "June", pronouns: "she/they" },
    ],
  },
};

export default function FriendSystemScreen() {
  const { id } = useLocalSearchParams();
  const friend = friendSystems[id as keyof typeof friendSystems];

  if (!friend) {
    return (
      <Screen style={styles.screen}>
        <Text>Friend not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Image source={{ uri: friend.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.subtext}>Front: {friend.fronters.join(", ")}</Text>
      </View>

      <Text style={styles.sectionTitle}>System Members</Text>

      <FlatList
        data={friend.members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberPronouns}>{item.pronouns}</Text>
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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#555",
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtext: {
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 10,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
  },
  memberPronouns: {
    opacity: 0.7,
    marginTop: 2,
  },
});