import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  displayName: string;
  username: string;
  avatar: string;
};

type ProfileContextType = {
  profile: Profile;
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
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("users_public")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("LOAD PROFILE ERROR:", error);
      return;
    }

    // 🔥 If profile doesn't exist → create it
    if (!data) {
      const baseUsername = user.email?.split("@")[0] ?? "user";
      const uniqueUsername = `${baseUsername}_${user.id.slice(0, 6)}`;

      const { error: insertError } = await supabase
        .from("users_public")
        .insert({
          user_id: user.id,
          username: uniqueUsername,
          display_name: "",
          avatar_url: "",
        });

      if (insertError) {
        console.log("CREATE PROFILE ERROR:", insertError);
        return;
      }

      return loadProfile(); // reload after create
    }

    // 🔥 Fix missing username (OLD USERS)
    if (!data.username) {
      const baseUsername = user.email?.split("@")[0] ?? "user";
      const uniqueUsername = `${baseUsername}_${user.id.slice(0, 6)}`;

      await supabase
        .from("users_public")
        .update({ username: uniqueUsername })
        .eq("user_id", user.id);

      data.username = uniqueUsername;
    }

    // ✅ Set profile
    setProfile({
      displayName: data.display_name ?? "",
      username: data.username ?? "",
      avatar: data.avatar_url ?? "",
    });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
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
      ...prev,
      ...updates,
    }));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      loadProfile,
    }),
    [profile]
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