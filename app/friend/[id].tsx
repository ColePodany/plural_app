import Screen from "@/components/Screen";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

type Member = {
  id: string;
  name: string;
  pronouns: string | null;
  icon_url: string | null;
};

type FriendProfile = {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

export default function FriendSystemScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const friendId = Array.isArray(id) ? id[0] : id;

  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [frontName, setFrontName] = useState<string | null>(null);
  const [frontProfileId, setFrontProfileId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriendSystem = async () => {
      if (!friendId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from("users_public")
        .select("user_id, display_name, username, avatar_url")
        .eq("user_id", friendId)
        .maybeSingle();

      if (userError) {
        console.log("FRIEND PROFILE ERROR:", userError);
      }

      const { data: frontData, error: frontError } = await supabase
        .from("front_status")
        .select(
          `
          user_id,
          profile_id,
          profiles (
            id,
            name,
            icon_url
          )
        `
        )
        .eq("user_id", friendId)
        .maybeSingle();

      if (frontError) {
        console.log("FRONT STATUS ERROR:", frontError);
      }

      const frontProfile = Array.isArray(frontData?.profiles)
        ? frontData.profiles[0]
        : frontData?.profiles;

      const { data: memberData, error: memberError } = await supabase
        .from("profiles")
        .select("id, name, pronouns, icon_url")
        .eq("user_id", friendId);

      if (memberError) {
        console.log("FRIEND MEMBERS ERROR:", memberError);
      }

      setFriend(userData ?? null);
      setFrontName(frontProfile?.name ?? null);
      setFrontProfileId(frontData?.profile_id ? String(frontData.profile_id) : null);
      setMembers((memberData as Member[]) ?? []);
      setLoading(false);
    };

    loadFriendSystem();
  }, [friendId]);

  const frontingMembers = useMemo(() => {
    if (!frontProfileId) return [];
    return members.filter((member) => String(member.id) === frontProfileId);
  }, [members, frontProfileId]);

  const otherMembers = useMemo(() => {
    if (!frontProfileId) return members;
    return members.filter((member) => String(member.id) !== frontProfileId);
  }, [members, frontProfileId]);

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </Screen>
    );
  }

  if (!friend) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <Text>Friend not found.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={otherMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Image
                source={{ uri: friend.avatar_url || "https://placehold.co/100" }}
                style={styles.avatar}
              />
              <Text style={styles.name}>{friend.display_name || "No name"}</Text>
              <Text style={styles.username}>@{friend.username}</Text>
              <Text style={styles.subtext}>
                Front: {frontName ?? "No fronter set"}
              </Text>
            </View>

            {frontingMembers.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Currently Fronting</Text>
                {frontingMembers.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.memberRow}>
                      <Image
                        source={{ uri: item.icon_url || "https://placehold.co/100" }}
                        style={styles.memberAvatar}
                      />
                      <View>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberPronouns}>
                          {item.pronouns || "No pronouns"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Other Members</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {frontingMembers.length > 0
              ? "No other system members found."
              : "No system members found."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.memberRow}>
              <Image
                source={{ uri: item.icon_url || "https://placehold.co/100" }}
                style={styles.memberAvatar}
              />
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberPronouns}>
                  {item.pronouns || "No pronouns"}
                </Text>
              </View>
            </View>
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
    backgroundColor: "#f7f7f7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 24,
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
    color: "#111",
  },
  username: {
    marginTop: 4,
    color: "#666",
  },
  subtext: {
    marginTop: 6,
    opacity: 0.7,
    color: "#444",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },
  emptyText: {
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
    color: "#666",
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  memberPronouns: {
    opacity: 0.7,
    marginTop: 2,
    color: "#666",
  },
});