import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Profile = {
  displayName: string;
  username: string;
  avatar: string;
};

type ProfileContextType = {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const initialProfile: Profile = {
  displayName: "Alex",
  username: "alex",
  avatar: "https://placehold.co/100",
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
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