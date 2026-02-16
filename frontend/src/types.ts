export type Entitlement = {
  is_paid: boolean;
  plan?: string | null;
  expires_at?: string | null;
};

export type ProgressSummary = {
  found_count: number;
  mistakes: number;
  completed: boolean;
};

export type DailyPuzzleResponse = {
  date: string;
  board: string[];
  total_sets: number;
  progress: ProgressSummary;
  entitlement: Entitlement;
};

export type GuessResponse = {
  is_set: boolean;
  already_found?: boolean;
  found_count?: number;
  total_sets?: number;
  completed?: boolean;
};

export type FoundSet = {
  id: string;
  cards: string[];
  typeLabel: string;
};
