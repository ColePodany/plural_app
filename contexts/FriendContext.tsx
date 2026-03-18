import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Friend = {
  friend_id: string;
  users_public: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  current_front: {
    id: string;
    name: string;
    icon_url: string | null;
  } | null;
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

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const loadFriends = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFriends([]);
      return;
    }

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
      users_public: item.users_public
        ? {
            display_name: item.users_public.display_name,
            username: item.users_public.username,
            avatar_url: item.users_public.avatar_url,
          }
        : null,
    }));

    const friendIds = baseFriends.map((friend) => friend.friend_id);

    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    const { data: fronts, error: frontsError } = await supabase
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
      .in("user_id", friendIds);

    if (frontsError) {
      console.log("LOAD FRIEND FRONTS ERROR:", frontsError);
    }

    const formatted: Friend[] = baseFriends.map((friend) => {
      const front =
        fronts?.find((item: any) => item.user_id === friend.friend_id) ?? null;

      const profile = Array.isArray(front?.profiles)
        ? front.profiles[0]
        : front?.profiles;

      return {
        friend_id: friend.friend_id,
        users_public: friend.users_public,
        current_front: profile
          ? {
              id: String(profile.id),
              name: profile.name,
              icon_url: profile.icon_url,
            }
          : null,
      };
    });

    setFriends(formatted);
  };

  const loadRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

  const sendRequest = async (username: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

  const acceptRequest = async (requestId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

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

export const useFriends = () => {
  const context = useContext(FriendContext);

  if (!context) {
    throw new Error("useFriends must be used inside FriendProvider");
  }

  return context;
};