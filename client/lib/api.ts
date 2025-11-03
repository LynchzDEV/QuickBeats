const API_BASE = "http://localhost:3001";

export interface Artist {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  genres: string[];
}

export interface SearchArtistsResponse {
  artists: Artist[];
}

export interface GameRound {
  roundId: string;
  previewUrl: string;
  previewStartTime: number;
  previewDuration: number;
  choices: Array<{
    id: string;
    trackName: string;
    artistName: string;
  }>;
  albumArt?: string;
  signature: string;
}

export interface GameSession {
  sessionId: string;
  mode: string;
  round: GameRound;
  score: number;
  roundsPlayed: number;
}

export interface AnswerResponse {
  correct: boolean;
  correctAnswerId: string;
  score: number;
  roundsPlayed: number;
}

export const api = {
  async searchArtists(query: string): Promise<SearchArtistsResponse> {
    const res = await fetch(`${API_BASE}/artists/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to search artists");
    return res.json();
  },

  async createGameSession(
    mode: string,
    artistId?: string,
    sourceOrPlaylistId?: string
  ): Promise<GameSession> {
    const body: {
      mode: string;
      artistId?: string;
      playlistId?: string;
      source?: string;
    } = { mode };

    if (artistId) {
      body.artistId = artistId;
    }

    // For playlist mode, use playlistId; for top-tracks, use source
    if (sourceOrPlaylistId) {
      if (mode === "playlist") {
        body.playlistId = sourceOrPlaylistId;
      } else if (mode === "top-tracks") {
        body.source = sourceOrPlaylistId;
      }
    }

    const res = await fetch(`${API_BASE}/game/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for auth
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create game session");
    return res.json();
  },

  async submitAnswer(
    sessionId: string,
    roundId: string,
    choiceId: string
  ): Promise<AnswerResponse> {
    const res = await fetch(`${API_BASE}/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, roundId, choiceId }),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
  },
};
