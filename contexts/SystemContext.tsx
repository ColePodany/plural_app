import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Alter, FrontSession, SystemContextType } from "../types/system";

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const initialAlters: Alter[] = [];

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
  const [alters, setAlters] = useState<Alter[]>(initialAlters);
const [currentFrontIds, setCurrentFrontIds] = useState<string[]>([]);
const [history, setHistory] = useState<FrontSession[]>([]);

  const addAlter = (alter: Omit<Alter, "id">) => {
    const newAlter: Alter = {
      id: Date.now().toString(),
      ...alter,
    };
    setAlters((prev) => [newAlter, ...prev]);
  };

  const updateAlter = (id: string, updates: Partial<Alter>) => {
    setAlters((prev) =>
      prev.map((alter) => (alter.id === id ? { ...alter, ...updates } : alter))
    );
  };

  const toggleFront = (alterId: string) => {
    const now = new Date();

    setCurrentFrontIds((prev) => {
      const isFronting = prev.includes(alterId);

      if (isFronting) {
        setHistory((oldHistory) =>
          oldHistory.map((session) => {
            if (
              session.alterId === alterId &&
              session.end === null &&
              !session.allDay
            ) {
              return {
                ...session,
                end: now.toISOString(),
              };
            }
            return session;
          })
        );

        return prev.filter((id) => id !== alterId);
      }

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

      return [...prev, alterId];
    });
  };

  const value = useMemo(
    () => ({
      alters,
      currentFrontIds,
      history,
      addAlter,
      updateAlter,
      toggleFront,
    }),
    [alters, currentFrontIds, history]
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error("useSystem must be used inside a SystemProvider");
  }

  return context;
}