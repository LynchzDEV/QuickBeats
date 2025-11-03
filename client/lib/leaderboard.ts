const API_BASE = "http://localhost:3001";

export interface LeaderboardEntry {
  name: string;
  score: number;
  mode: string;
  timestamp: number;
}

export interface LeaderboardSubmitResponse {
  success: boolean;
  rank: number;
  score: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: number;
}

export const leaderboardApi = {
  async submitScore(sessionId: string, name: string): Promise<LeaderboardSubmitResponse> {
    const res = await fetch(`${API_BASE}/leaderboard/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to submit score");
    }
    return res.json();
  },

  async getTopScores(limit: number = 10, mode?: string): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (mode && mode !== "all") params.append("mode", mode);

    const res = await fetch(`${API_BASE}/leaderboard/top?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json();
  },
};
