type FriendRequest = {
  id: string;

  // This represents "the OTHER user"
  user_id: string;

  users_public: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
};