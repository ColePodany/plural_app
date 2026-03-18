type Friend = {
  friend_id: string;

  users_public: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;

  current_fronts: {
    id: string;
    name: string;
    icon_url: string | null;
  }[];
};