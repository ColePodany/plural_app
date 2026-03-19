import Screen from "@/components/Screen";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function FriendAlterScreen() {
  const { alterId } = useLocalSearchParams<{ alterId: string }>();

  const [alter, setAlter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlter = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, pronouns, description, icon_url")
        .eq("id", alterId)
        .maybeSingle();

      if (error) {
        console.log("LOAD FRIEND ALTER ERROR:", error);
      }

      setAlter(data);
      setLoading(false);
    };

    loadAlter();
  }, [alterId]);

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <Text>Loading...</Text>
      </Screen>
    );
  }

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
            uri:
              alter.icon_url ||
              "https://placehold.co/100x100/444/FFF/png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{alter.name}</Text>

        {alter.pronouns && (
          <Text style={styles.pronouns}>{alter.pronouns}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bodyText}>
          {alter.description || "No description."}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
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
    color: "#111",
  },

  pronouns: {
    opacity: 0.7,
    marginTop: 4,
    color: "#666",
  },

  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  bodyText: {
    color: "#444",
  },
});