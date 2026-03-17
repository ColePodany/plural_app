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
      setAlters(data as Alter[]);
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
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("LOAD FRONT STATUS ERROR:", error);
      return;
    }

    if (data) {
      setCurrentFrontIds([data.profile_id]);
    }
  };

  const toggleFront = async (alterId: string) => {

    const isFronting = currentFrontIds.includes(alterId);
    const now = new Date();

    if (isFronting) {
      await updateFrontStatus(null);
      setCurrentFrontIds([]);

      setHistory((oldHistory) =>
        oldHistory.map((session) => {
          if (session.alterId === alterId && session.end === null) {
            return { ...session, end: now.toISOString() };
          }
          return session;
        })
      );

      return;
    }

    await updateFrontStatus(alterId);
    setCurrentFrontIds([alterId]);

    setHistory((oldHistory) => [
      {
        id: Date.now().toString(),
        alterId,
        start: now.toISOString(),
        end: null,
        date: getTodayLabel(),
      },
      ...oldHistory,
    ]);
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