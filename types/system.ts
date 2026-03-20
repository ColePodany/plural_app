export type Alter = {
  id: string;
  name: string;
  pronouns: string | null;
  avatar: string | null;
  description: string | null;

  folders: {
    id: string;
    name: string;
  }[];

  customFields: {
    label: string;
    value: string;
  }[];
};

export type FrontSession = {
  id: string;
  alterId: string;
  name?: string;
  avatar?: string | null;
  start: string;
  end: string | null;
  date: string;
  allDay?: boolean;
};

export type SystemContextType = {
  alters: Alter[];
  currentFrontIds: string[];
  history: FrontSession[];
  addAlter: (alter: Omit<Alter, "id">) => Promise<void>;
  updateAlter: (id: string, updates: Partial<Alter>) => Promise<void>;
  deleteAlter: (id: string) => Promise<void>;
toggleFront: (id: string) => void;
  updateFrontStatus: (profileId: string | null) => Promise<void>;
  reloadAlters: () => Promise<void>;
  reloadHistory: (page?: number) => Promise<void>;
reloadHistoryRange: (start: Date, end: Date) => Promise<void>;
  reloadFrontStatus: () => Promise<void>;
addToFront: (alterId: string) => Promise<void>;
removeFromFront: (alterId: string) => Promise<void>;
};