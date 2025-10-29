export interface Track {
  id: string;
  name: string;
  previewUrl: string;
  durationMs: number;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

export interface Choice {
  id: string;
  trackName: string;
  artistName: string;
}

export interface GameRound {
  roundId: string;
  previewUrl: string;
  previewStartTime: number;
  previewDuration: number;
  choices: Choice[];
  albumArt?: string;
  signature: string;
}

export interface GameSession {
  sessionId: string;
  mode: "artist" | "personal";
  round: GameRound;
  score: number;
  roundsPlayed: number;
}

export interface RoundAnswer {
  sessionId: string;
  roundId: string;
  choiceId: string;
}
