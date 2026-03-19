import Screen from "@/components/Screen";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
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

  const { session } = useAuth();
  const userId = session?.user?.id;

  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [frontIds, setFrontIds] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- DELETE FRIEND ---------------- */

  const removeFriend = async () => {
    if (!friendId || !userId) return;

    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            // 🔥 delete friendships BOTH directions
            const { error: friendError } = await supabase
              .from("friendships")
              .delete()
              .or(
                `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
              );

            if (friendError) {
              console.log("REMOVE FRIEND ERROR:", friendError);
              Alert.alert("Error", "Failed to remove friend.");
              return;
            }

            // 🔥 also clean up requests
            await supabase
              .from("friend_requests")
              .delete()
              .or(
                `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
              );

            router.back();
          },
        },
      ]
    );
  };

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const loadFriendSystem = async () => {
      if (!friendId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: userData } = await supabase
        .from("users_public")
        .select("user_id, display_name, username, avatar_url")
        .eq("user_id", friendId)
        .maybeSingle();

      const { data: frontData } = await supabase
        .from("front_status")
        .select("profile_id")
        .eq("user_id", friendId);

      const ids = (frontData || []).map((row: any) =>
        String(row.profile_id)
      );

      const { data: memberData } = await supabase
        .from("profiles")
        .select("id, name, pronouns, icon_url")
        .eq("user_id", friendId);

      setFriend(userData ?? null);
      setFrontIds(ids);
      setMembers((memberData as Member[]) ?? []);
      setLoading(false);
    };

    loadFriendSystem();
  }, [friendId]);

  /* ---------------- SPLIT MEMBERS ---------------- */

  const frontingMembers = useMemo(() => {
    return members.filter((m) => frontIds.includes(String(m.id)));
  }, [members, frontIds]);

  const otherMembers = useMemo(() => {
    return members.filter((m) => !frontIds.includes(String(m.id)));
  }, [members, frontIds]);

  /* ---------------- STATES ---------------- */

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

  /* ---------------- UI ---------------- */

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
                source={{
                  uri: friend.avatar_url || "https://placehold.co/100",
                }}
                style={styles.avatar}
              />

              <Text style={styles.name}>
                {friend.display_name || "No name"}
              </Text>

              <Text style={styles.username}>@{friend.username}</Text>

              <Text style={styles.subtext}>
                Front:{" "}
                {frontingMembers.length > 0
                  ? frontingMembers.map((m) => m.name).join(", ")
                  : "No fronters"}
              </Text>

              {/* 🔥 DELETE BUTTON */}
              <Pressable style={styles.deleteButton} onPress={removeFriend}>
                <Text style={styles.deleteText}>Remove Friend</Text>
              </Pressable>
            </View>

            {frontingMembers.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Currently Fronting
                </Text>

               {frontingMembers.map((item) => (
  <Pressable
    key={item.id}
    style={styles.card}
    onPress={() =>
      router.push({
        pathname: "/friend/alter/[alterId]",
        params: {
          alterId: item.id,
          friendId: friendId,
        },
      })
    }
  >
                    <View style={styles.memberRow}>
                      <Image
                        source={{
                          uri:
                            item.icon_url ||
                            "https://placehold.co/100",
                        }}
                        style={styles.memberAvatar}
                      />
                      <View>
                        <Text style={styles.memberName}>
                          {item.name}
                        </Text>
                        <Text style={styles.memberPronouns}>
                          {item.pronouns || "No pronouns"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
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
         <Pressable
  style={styles.card}
  onPress={() =>
    router.push({
      pathname: "/friend/alter/[alterId]",
      params: {
        alterId: item.id,
        friendId: friendId,
      },
    })
  }
>
            <View style={styles.memberRow}>
              <Image
                source={{
                  uri: item.icon_url || "https://placehold.co/100",
                }}
                style={styles.memberAvatar}
              />
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberPronouns}>
                  {item.pronouns || "No pronouns"}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

/* ---------------- STYLES ---------------- */

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

  deleteButton: {
    marginTop: 12,
    backgroundColor: "#ff3b30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
  },
});