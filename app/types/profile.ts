export type Profile = {
  displayName: string;
  username: string;
  avatar: string;
};

export type ProfileContextType = {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
};