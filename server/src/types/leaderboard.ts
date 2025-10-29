export interface LeaderboardEntry {
  name: string;
  score: number;
  mode: string;
  timestamp: number;
}

export interface LeaderboardSubmission {
  sessionId: string;
  name: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: number;
}
