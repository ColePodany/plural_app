export type Friend = {
  id: string;
  name: string;
  avatar?: string;
  currentFront?: string[];
};

export type FriendRequest = {
  id: string;
  name: string;
  avatar?: string;
};

export type FriendContextType = {
  friends: Friend[];
  outgoingRequests: FriendRequest[];
  incomingRequests: FriendRequest[];
  sendFriendRequest: (name: string) => void;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  removeFriend: (id: string) => void;
};