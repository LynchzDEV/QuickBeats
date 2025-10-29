/**
 * Shared in-memory session storage
 * In production, this should be replaced with Redis or a database
 */

export interface GameSessionData {
  mode: string;
  score: number;
  roundsPlayed: number;
  currentRoundId: string;
  correctAnswerId: string;
}

export const activeSessions = new Map<string, GameSessionData>();
