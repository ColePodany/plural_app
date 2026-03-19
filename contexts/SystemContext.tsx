import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sendPush } from "../lib/sendPush";
import { supabase } from "../lib/supabase";
import { Alter, FrontSession, SystemContextType } from "../types/system";
import { useAuth } from "./AuthContext";

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(start: string, end: string) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const diffMs = Math.max(0, endMs - startMs);

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function SystemProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  const [alters, setAlters] = useState<Alter[]>([]);
  const [currentFrontIds, setCurrentFrontIds] = useState<string[]>([]);
  const [history, setHistory] = useState<FrontSession[]>([]);

  const loadAlters = async () => {
    const user = session?.user;
    if (!user) {
      setAlters([]);
      return;
    }


const { data } = await supabase
  .from("profiles")
  .select(`
    *,
    alter_folder_members (
      alter_folders (
        id,
        name
      )
    )
  `)
  .eq("user_id", user.id); // 🔥 REQUIRED

    if (data) {
    const mapped: Alter[] = data.map((row: any) => ({
  id: String(row.id),
  name: row.name,
  pronouns: row.pronouns,
  avatar: row.icon_url,
  description: row.description,

  // ✅ ADD THESE 2 LINES
 folders: (row.alter_folder_members || []).map((f: any) => {
  const folder = Array.isArray(f.alter_folders)
    ? f.alter_folders[0]
    : f.alter_folders;

  return {
    id: String(folder.id),
    name: folder.name,
  };
}),
}));

      setAlters(mapped);
    } else {
      setAlters([]);
    }
  };

  const addAlter = async (alter: Omit<Alter, "id">) => {
  const user = session?.user;
  if (!user) return;

  const { error } = await supabase.from("profiles").insert([
    {
      user_id: user.id,
      name: alter.name,
      pronouns: alter.pronouns,
      icon_url: alter.avatar,
      description: alter.description,
    },
  ]);

  if (error) {
    console.log("ADD ALTER ERROR:", error);
    return;
  }

  await loadAlters();
};

  const updateAlter = async (id: string, updates: Partial<Alter>) => {
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: updates.name,
        pronouns: updates.pronouns,
        icon_url: updates.avatar,
        description: updates.description,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.log("UPDATE ALTER ERROR:", error);
      return;
    }

    await loadAlters();
    await loadHistory();
  };

  const deleteAlter = async (id: string) => {
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.log("DELETE ALTER ERROR:", error);
      return;
    }

    await loadAlters();
    await loadFrontStatus();
    await loadHistory();
  };

  const updateFrontStatus = async (profileId: string | null) => {
    const user = session?.user;
    if (!user) return;

    if (profileId === null) {
      const { error } = await supabase
        .from("front_status")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.log("CLEAR FRONT STATUS ERROR:", error);
        return;
      }

      setCurrentFrontIds([]);
      return;
    }

    const { error } = await supabase.from("front_status").upsert({
      user_id: user.id,
      profile_id: profileId,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log("UPDATE FRONT STATUS ERROR:", error);
      return;
    }

    await loadFrontStatus();
  };

  const loadFrontStatus = async () => {
  const user = session?.user;
  if (!user) {
    setCurrentFrontIds([]);
    return;
  }

  const { data, error } = await supabase
    .from("front_status")
    .select("profile_id")
    .eq("user_id", user.id);

  if (error) {
    console.log("LOAD FRONT STATUS ERROR:", error);
    return;
  }

  const incoming = (data || []).map((row: any) =>
    String(row.profile_id)
  );

  setCurrentFrontIds((prev) => {
    // 🔥 DO NOT overwrite if identical
    const same =
      prev.length === incoming.length &&
      prev.every((id) => incoming.includes(id));

    return same ? prev : incoming;
  });
};

const addToFront = async (alterId: string) => {
  const user = session?.user;
  if (!user) return;

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("front_status")
    .upsert(
      {
        user_id: user.id,
        profile_id: alterId,
        updated_at: now,
      },
      { onConflict: "user_id,profile_id" }
    );

  if (error) {
    console.log("ADD TO FRONT ERROR:", error);
    return;
  }

  setCurrentFrontIds((prev) =>
    prev.includes(alterId) ? prev : [...prev, alterId]
  );

  const { error: historyError } = await supabase
    .from("front_history")
    .insert({
      user_id: user.id,
      profile_id: alterId,
      start_time: now,
    });

  if (historyError) {
    console.log("START FRONT HISTORY ERROR:", historyError);
  }
};

const removeFromFront = async (alterId: string) => {
  const user = session?.user;
  if (!user) return;

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("front_status")
    .delete()
    .eq("user_id", user.id)
    .eq("profile_id", alterId);

  if (error) {
    console.log("REMOVE FROM FRONT ERROR:", error);
    return;
  }

  setCurrentFrontIds((prev) => prev.filter((id) => id !== alterId));

  const { error: historyError } = await supabase
    .from("front_history")
    .update({ end_time: now })
    .eq("user_id", user.id)
    .eq("profile_id", alterId)
    .is("end_time", null);

  if (historyError) {
    console.log("END FRONT HISTORY ERROR:", historyError);
  }
};

const toggleFront = async (alterId: string) => {
  const normalizedId = String(alterId);
  const user = session?.user;
  if (!user) return;

  const now = new Date().toISOString();

  // ✅ use functional state so TS + React stay in sync
  setCurrentFrontIds((prev) => {
    const isFronting = prev.includes(normalizedId);

    const nextFrontIds = isFronting
      ? prev.filter((id) => id !== normalizedId)
      : [...prev, normalizedId];

    // 🔥 run async AFTER computing next state
    (async () => {
      try {
        console.log("🔥 TOGGLE BACKEND START");

        // =====================
        // DB SYNC
        // =====================
        if (isFronting) {
          console.log("➡️ Removing from front");

          await supabase
            .from("front_status")
            .delete()
            .eq("user_id", user.id)
            .eq("profile_id", normalizedId);

          await supabase
            .from("front_history")
            .update({ end_time: now })
            .eq("user_id", user.id)
            .eq("profile_id", normalizedId)
            .is("end_time", null);
        } else {
          console.log("➡️ Adding to front");

          await supabase
            .from("front_status")
            .upsert(
              {
                user_id: user.id,
                profile_id: normalizedId,
                updated_at: now,
              },
              { onConflict: "user_id,profile_id" }
            );

          await supabase.from("front_history").insert({
            user_id: user.id,
            profile_id: normalizedId,
            start_time: now,
          });
        }

        // =====================
        // BUILD MESSAGE
        // =====================
        const frontNames = alters
          .filter((a) => nextFrontIds.includes(a.id))
          .map((a) => a.name);

          // 🔥 GET USER DISPLAY NAME
const { data: profile } = await supabase
  .from("users_public")
  .select("display_name, username")
  .eq("user_id", user.id)
  .single();

const displayName =
  profile?.display_name || profile?.username || "Someone";

    const message =
  frontNames.length > 0
    ? `${displayName}: ${frontNames.join(", ")}`
    : `${displayName}: No one is fronting`;

        console.log("🧠 MESSAGE:", message);

        // =====================
        // FRIEND IDS
        // =====================
        const { data: friendRows } = await supabase
          .from("friendships")
          .select("friend_id")
          .eq("user_id", user.id);

        const friendIds = friendRows?.map((f: any) => f.friend_id) || [];

        console.log("👥 FRIEND IDS:", friendIds);

        // =====================
        // TOKENS
        // =====================
        const { data: tokens } = await supabase
          .from("device_tokens")
          .select("expo_push_token")
          .in("user_id", [user.id, ...friendIds]);

        console.log("📱 RAW TOKENS:", tokens);

        if (!tokens || tokens.length === 0) {
          console.log("❌ NO TOKENS FOUND");
          return;
        }

        const uniqueTokens = [
          ...new Set(tokens.map((t: any) => t.expo_push_token)),
        ];

        console.log("📦 UNIQUE TOKENS:", uniqueTokens);

        // =====================
        // SEND PUSH
        // =====================
        uniqueTokens.forEach((token) => {
          console.log("🚀 CALLING sendPush:", token);
          sendPush(token, "Front Update", message);
        });

      } catch (err) {
        console.log("❌ TOGGLE FRONT ERROR:", err);
      }
    })();

    return nextFrontIds;
  });
};

  const loadHistory = async () => {
    const user = session?.user;
    if (!user) {
      setHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from("front_history")
      .select(
        `
        id,
        profile_id,
        start_time,
        end_time,
        profiles (
          id,
          name,
          icon_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.log("LOAD HISTORY ERROR:", error);
      return;
    }

    if (data) {
      const mapped: FrontSession[] = data.map((row: any) => {
        const profile = Array.isArray(row.profiles)
          ? row.profiles[0]
          : row.profiles;

        return {
          id: String(row.id),
          alterId: String(row.profile_id),
          name: profile?.name ?? "Unknown",
          avatar: profile?.icon_url ?? null,
          start: row.start_time,
          end: row.end_time,
          date: new Date(row.start_time).toDateString(),
        };
      });

      setHistory(mapped);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      setAlters([]);
      setCurrentFrontIds([]);
      setHistory([]);
      return;
    }

    void loadAlters();
    void loadFrontStatus();
    void loadHistory();
  }, [session, loading]);

 const value = useMemo(
  () => ({
    alters,
    currentFrontIds,
    history,
    addAlter,
    updateAlter,
    deleteAlter,
    toggleFront,
    addToFront,
    removeFromFront,
    updateFrontStatus,
    reloadAlters: loadAlters,
    reloadHistory: loadHistory,
    reloadFrontStatus: loadFrontStatus,
  }),
  [alters, currentFrontIds, history]
);

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error("useSystem must be used inside a SystemProvider");
  }

  return context;
}