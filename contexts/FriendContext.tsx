import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

/* ------------------ TYPES ------------------ */

type Friend = {
  friend_id: string;
  users_public: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;

  current_fronts: {
    id: string;
    name: string;
    icon_url: string | null;
  }[];
};

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
};

type FriendContextType = {
  friends: Friend[];
  requests: FriendRequest[];
  sendRequest: (username: string) => Promise<boolean>;
  acceptRequest: (id: string) => Promise<void>;
  reloadFriends: () => Promise<void>;
  reloadRequests: () => Promise<void>;
};

/* ------------------ CONTEXT ------------------ */

const FriendContext = createContext<FriendContextType | undefined>(undefined);

/* ------------------ PROVIDER ------------------ */

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  /* ------------------ LOAD FRIENDS ------------------ */

  const loadFriends = async () => {
    const user = session?.user;

    if (!user) {
      setFriends([]);
      return;
    }

    // 🔹 base friend info
    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        friend_id,
        users_public!friend_id (
          display_name,
          username,
          avatar_url
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.log("LOAD FRIENDS ERROR:", error);
      return;
    }

    const baseFriends = (data || []).map((item: any) => ({
      friend_id: item.friend_id as string,
      users_public: item.users_public ?? null,
    }));

    const friendIds = baseFriends.map((f) => f.friend_id);

    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    // 🔥 get ALL front rows
    const { data: fronts, error: frontsError } = await supabase
  .from("front_status")
  .select(
    `
    user_id,
    profile_id,
    profiles!inner (
      id,
      name,
      icon_url,
      user_id
    )
  `
  )
  .in("user_id", friendIds);
    if (frontsError) {
      console.log("LOAD FRIEND FRONTS ERROR:", frontsError);
    }

    // 🔥 group by user_id
    const frontMap: Record<string, any[]> = {};

    (fronts || []).forEach((row: any) => {
      if (!frontMap[row.user_id]) {
        frontMap[row.user_id] = [];
      }
const profile = Array.isArray(row.profiles)
  ? row.profiles[0]
  : row.profiles;

// 🔥 extra safety check
if (!profile || profile.user_id !== row.user_id) return;

      if (profile) {
        frontMap[row.user_id].push({
          id: String(profile.id),
          name: profile.name,
          icon_url: profile.icon_url,
        });
      }
    });

    // 🔥 attach to friends
    const formatted: Friend[] = baseFriends.map((friend) => ({
      friend_id: friend.friend_id,
      users_public: friend.users_public,
      current_fronts: frontMap[friend.friend_id] || [],
    }));

    setFriends(formatted);
  };

  /* ------------------ LOAD REQUESTS ------------------ */

  const loadRequests = async () => {
    const user = session?.user;

    if (!user) {
      setRequests([]);
      return;
    }

    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.log("LOAD REQUESTS ERROR:", error);
      return;
    }

    setRequests((data || []) as FriendRequest[]);
  };

  /* ------------------ SEND REQUEST ------------------ */

  const sendRequest = async (username: string) => {
    const user = session?.user;
    if (!user) return false;

    const { data: target, error: targetError } = await supabase
      .from("users_public")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (targetError) {
      console.log("TARGET LOOKUP ERROR:", targetError);
      alert(targetError.message);
      return false;
    }

    if (!target) {
      alert("User not found");
      return false;
    }

    if (target.user_id === user.id) {
      alert("You can't friend yourself");
      return false;
    }

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id: target.user_id,
    });

    if (error) {
      console.log("SEND ERROR:", error);
      alert(error.message);
      return false;
    }

    await loadRequests();
    return true;
  };

  /* ------------------ ACCEPT REQUEST ------------------ */

  const acceptRequest = async (requestId: string) => {
    const user = session?.user;
    if (!user) return;

    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      console.log("ACCEPT REQUEST UPDATE ERROR:", updateError);
      return;
    }

    const { error: insertError } = await supabase.from("friendships").insert([
      { user_id: user.id, friend_id: request.sender_id },
      { user_id: request.sender_id, friend_id: user.id },
    ]);

    if (insertError) {
      console.log("CREATE FRIENDSHIPS ERROR:", insertError);
      return;
    }

    await loadFriends();
    await loadRequests();
  };

  /* ------------------ EFFECT ------------------ */

  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      setFriends([]);
      setRequests([]);
      return;
    }

    loadFriends();
    loadRequests();
  }, [session, loading]);

  /* ------------------ PROVIDER ------------------ */

  return (
    <FriendContext.Provider
      value={{
        friends,
        requests,
        sendRequest,
        acceptRequest,
        reloadFriends: loadFriends,
        reloadRequests: loadRequests,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

/* ------------------ HOOK ------------------ */

export const useFriends = () => {
  const context = useContext(FriendContext);

  if (!context) {
    throw new Error("useFriends must be used inside FriendProvider");
  }

  return context;
};