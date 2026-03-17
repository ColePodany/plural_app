export type Alter = {
  id: string;
  name: string;
  pronouns?: string;
  avatar?: string;
  description?: string;
};

export type FrontSession = {
  id: string;
  alterId: string;
  start: string;
  end: string | null;
  date: string;
  allDay?: boolean;
};

export type SystemContextType = {
  alters: Alter[];
  currentFrontIds: string[];
  history: FrontSession[];
  addAlter: (alter: Omit<Alter, "id">) => void;
  updateAlter: (id: string, updates: Partial<Alter>) => void;
  toggleFront: (alterId: string) => void;
};