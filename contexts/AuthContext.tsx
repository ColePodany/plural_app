import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { registerForPush } from "../lib/push";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------ LOAD SESSION ------------------ */

  useEffect(() => {
    let mounted = true;

    const loadInitialSession = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.log("GET SESSION ERROR:", error);
      }

      setSession(session ?? null);
      setLoading(false);
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setSession(session ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ------------------ PUSH REGISTRATION ------------------ */

  useEffect(() => {
    if (!session?.user) return;

    // 🔥 important: do NOT block UI
    registerForPush(session.user.id).catch((err) => {
      console.log("PUSH REGISTRATION ERROR:", err);
    });
  }, [session]);

  /* ------------------ PROVIDER ------------------ */

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}