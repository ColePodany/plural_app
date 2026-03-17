import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Alter, FrontSession, SystemContextType } from "../types/system";

const SystemContext = createContext<SystemContextType | undefined>(undefined);

function getTodayLabel() {
  return "Today";
}

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

  const [alters, setAlters] = useState<Alter[]>([]);
  const [currentFrontIds, setCurrentFrontIds] = useState<string[]>([]);
  const [history, setHistory] = useState<FrontSession[]>([]);

useEffect(() => {
  loadAlters();
  loadFrontStatus();
  loadHistory();
}, []);

 const loadAlters = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("LOAD ALTERS ERROR:", error);
    return;
  }

  if (data) {
    const mapped = data.map((row) => ({
      id: row.id,
      name: row.name,
      pronouns: row.pronouns,
      avatar: row.icon_url,
      description: row.description,
    }));

    setAlters(mapped);
  }
};

  const addAlter = async (alter: Omit<Alter, "id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .insert([
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
    const { error } = await supabase
      .from("profiles")
      .update({
        name: updates.name,
        pronouns: updates.pronouns,
        icon_url: updates.avatar,
        description: updates.description,
      })
      .eq("id", id);

    if (error) {
      console.log("UPDATE ALTER ERROR:", error);
      return;
    }

    await loadAlters();
  };

  const deleteAlter = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("DELETE ALTER ERROR:", error);
      return;
    }

    await loadAlters();
  };

  const updateFrontStatus = async (profileId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (profileId === null) {
      await supabase
        .from("front_status")
        .delete()
        .eq("user_id", user.id);
      return;
    }

    await supabase
      .from("front_status")
      .upsert({
        user_id: user.id,
        profile_id: profileId,
        updated_at: new Date().toISOString(),
      });
  };

  const loadFrontStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("front_status")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.log("LOAD FRONT STATUS ERROR:", error);
    return;
  }

  if (data) {
    setCurrentFrontIds(data.map((row) => row.profile_id));
  }
};

 const toggleFront = async (alterId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const isFronting = currentFrontIds.includes(alterId);
  const now = new Date();

  if (isFronting) {

    await supabase
      .from("front_status")
      .delete()
      .eq("user_id", user.id)
      .eq("profile_id", alterId);

    await supabase
      .from("front_history")
      .update({ end_time: now.toISOString() })
      .eq("user_id", user.id)
      .eq("profile_id", alterId)
      .is("end_time", null);

    setCurrentFrontIds((prev) => prev.filter((id) => id !== alterId));

    await loadHistory();
    return;
  }

  await supabase
    .from("front_status")
    .insert({
      user_id: user.id,
      profile_id: alterId,
      updated_at: now.toISOString(),
    });

  await supabase
    .from("front_history")
    .insert({
      user_id: user.id,
      profile_id: alterId,
      start_time: now.toISOString(),
    });

  setCurrentFrontIds((prev) => [...prev, alterId]);

  await loadHistory();
};

const loadHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("front_history")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });

  if (error) {
    console.log("LOAD HISTORY ERROR:", error);
    return;
  }

  if (data) {
    const mapped = data.map((row) => ({
      id: row.id,
      alterId: row.profile_id,
      start: row.start_time,
      end: row.end_time,
      date: new Date(row.start_time).toDateString(),
    }));

    setHistory(mapped);
  }
};

  const value = useMemo(
    () => ({
      alters,
      currentFrontIds,
      history,
      addAlter,
      updateAlter,
      deleteAlter,
      toggleFront,
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