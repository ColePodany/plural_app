import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { useSystem } from "../../contexts/SystemContext";

export default function HomeScreen() {
  const { alters, currentFrontIds, toggleFront } = useSystem();
  const insets = useSafeAreaInsets();

  const fronters = alters.filter((alter) => currentFrontIds.includes(alter.id));
  const nonFronters = alters.filter(
    (alter) => !currentFrontIds.includes(alter.id)
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
        data={nonFronters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Current Fronters</Text>

            {fronters.length === 0 ? (
              <Text style={styles.emptyText}>No one is fronting.</Text>
            ) : (
              fronters.map((alter) => (
                <View key={alter.id} style={styles.card}>
                  <Pressable
                    style={styles.cardMain}
                    onPress={() => router.push(`/alter/${alter.id}`)}
                  >
                    <Image
                      source={{ uri: alter.avatar || "https://placehold.co/100" }}
                      style={styles.avatar}
                    />

                    <View style={styles.cardText}>
                      <Text style={styles.name}>{alter.name}</Text>
                      {!!alter.pronouns && (
                        <Text style={styles.pronouns}>{alter.pronouns}</Text>
                      )}
                    </View>
                  </Pressable>

                  <Pressable
                    style={styles.frontToggle}
                    onPress={() => toggleFront(alter.id)}
                  >
                    <Ionicons name="remove" size={18} color="white" />
                  </Pressable>
                </View>
              ))
            )}

            <Text style={styles.heading}>All Members</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No alters yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={styles.cardMain}
              onPress={() => router.push(`/alter/${item.id}`)}
            >
              <Image
                source={{ uri: item.avatar || "https://placehold.co/100" }}
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
              style={styles.frontToggle}
              onPress={() => toggleFront(item.id)}
            >
              <Ionicons name="add" size={18} color="white" />
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
  },
  container: {
    padding: 16,
    paddingTop: 56,
    paddingBottom: 32,
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
    marginBottom: 12,
  },
  emptyText: {
    opacity: 0.7,
    marginBottom: 16,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});