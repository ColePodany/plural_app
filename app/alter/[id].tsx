import Screen from "@/components/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSystem } from "../../contexts/SystemContext";

export default function AlterDetailScreen() {
  const { id } = useLocalSearchParams();
  const { alters, currentFrontIds, toggleFront } = useSystem();

  const alter = alters.find((a) => a.id === id);
  const isFronting = alter ? currentFrontIds.includes(alter.id) : false;

  if (!alter) {
    return (
      <Screen style={styles.screen}>
        <Text>Alter not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Image
  source={{
    uri: alter.avatar || "https://placehold.co/100x100/444/FFF/png"
  }}
  style={styles.avatar}
/>
        <Text style={styles.name}>{alter.name}</Text>
        <Text style={styles.pronouns}>{alter.pronouns}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text>{alter.description || "No description yet."}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => toggleFront(alter.id)}>
        <Text style={styles.buttonText}>
          {isFronting ? "Remove from Front" : "Set as Fronting"}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 10 }]}
        onPress={() => router.push(`/alter/edit/${alter.id}`)}
      >
        <Text style={styles.buttonText}>Edit Alter</Text>
      </Pressable>
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#555",
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
  },
  pronouns: {
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#444",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});