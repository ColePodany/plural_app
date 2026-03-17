import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Friend, FriendContextType, FriendRequest } from "../types/friend";

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);

  const sendFriendRequest = (name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return;

    const alreadyFriend = friends.some(
      (friend) => friend.name.toLowerCase() === cleaned.toLowerCase()
    );
    const alreadyOutgoing = outgoingRequests.some(
      (req) => req.name.toLowerCase() === cleaned.toLowerCase()
    );

    if (alreadyFriend || alreadyOutgoing) return;

    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      name: cleaned,
      avatar: "",
    };

    setOutgoingRequests((prev) => [newRequest, ...prev]);
  };

  const acceptFriendRequest = (id: string) => {
    const request = incomingRequests.find((req) => req.id === id);
    if (!request) return;

    const newFriend: Friend = {
      id: request.id,
      name: request.name,
      avatar: request.avatar,
      currentFront: [],
    };

    setFriends((prev) => [newFriend, ...prev]);
    setIncomingRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const declineFriendRequest = (id: string) => {
    setIncomingRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const removeFriend = (id: string) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== id));
  };

  const value = useMemo(
    () => ({
      friends,
      outgoingRequests,
      incomingRequests,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
    }),
    [friends, outgoingRequests, incomingRequests]
  );

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);

  if (!context) {
    throw new Error("useFriends must be used inside a FriendProvider");
  }

  return context;
}