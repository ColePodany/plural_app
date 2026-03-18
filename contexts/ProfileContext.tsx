import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type Profile = {
  displayName: string;
  username: string;
  avatar: string;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  loadProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const initialProfile: Profile = {
  displayName: "",
  username: "",
  avatar: "",
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const user = session?.user;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("users_public")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("LOAD PROFILE ERROR:", error);
      setLoading(false);
      return;
    }

    if (!data) {
      const baseUsername = user.email?.split("@")[0] ?? "user";
      const uniqueUsername = `${baseUsername}_${user.id.slice(0, 6)}`;

      const { error: insertError } = await supabase.from("users_public").insert({
        user_id: user.id,
        username: uniqueUsername,
        display_name: "",
        avatar_url: "",
      });

      if (insertError) {
        console.log("CREATE PROFILE ERROR:", insertError);
        setLoading(false);
        return;
      }

      const createdProfile: Profile = {
        displayName: "",
        username: uniqueUsername,
        avatar: "",
      };

      setProfile(createdProfile);
      setLoading(false);
      return;
    }

    let finalUsername = data.username ?? "";

    if (!data.username) {
      const baseUsername = user.email?.split("@")[0] ?? "user";
      const uniqueUsername = `${baseUsername}_${user.id.slice(0, 6)}`;

      const { error: usernameUpdateError } = await supabase
        .from("users_public")
        .update({ username: uniqueUsername })
        .eq("user_id", user.id);

      if (usernameUpdateError) {
        console.log("FIX USERNAME ERROR:", usernameUpdateError);
      } else {
        finalUsername = uniqueUsername;
      }
    }

    setProfile({
      displayName: data.display_name ?? "",
      username: finalUsername,
      avatar: data.avatar_url ?? "",
    });

    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase
      .from("users_public")
      .update({
        display_name: updates.displayName,
        avatar_url: updates.avatar,
        username: updates.username,
      })
      .eq("user_id", user.id);

    if (error) {
      console.log("UPDATE PROFILE ERROR:", error);
      return;
    }

    setProfile((prev) => ({
      ...(prev ?? initialProfile),
      ...updates,
    }));
  };

  useEffect(() => {
    if (authLoading) return;

    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    loadProfile();
  }, [session, authLoading]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      updateProfile,
      loadProfile,
    }),
    [profile, loading]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside a ProfileProvider");
  }

  return context;
}