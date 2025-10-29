import { Elysia, t } from "elysia";
import type { LeaderboardEntry, LeaderboardResponse } from "../types/leaderboard";
import { activeSessions } from "../lib/sessionStore";

// In-memory storage (in production, use database)
const leaderboard: LeaderboardEntry[] = [];

// Deduplication: track submission hash and timestamp
// Hash format: sessionId:name
const submissionCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Create submission hash for deduplication
 */
function createSubmissionHash(sessionId: string, name: string): string {
  return `${sessionId}:${name.toLowerCase().trim()}`;
}

/**
 * Check if submission is allowed (not in cooldown)
 */
function canSubmit(hash: string): boolean {
  const lastSubmission = submissionCooldowns.get(hash);
  if (!lastSubmission) {
    return true;
  }

  const timeSinceLastSubmit = Date.now() - lastSubmission;
  return timeSinceLastSubmit >= COOLDOWN_MS;
}

/**
 * Clean expired cooldowns periodically
 */
function cleanExpiredCooldowns(): void {
  const now = Date.now();
  const expired: string[] = [];

  for (const [hash, timestamp] of submissionCooldowns.entries()) {
    if (now - timestamp >= COOLDOWN_MS) {
      expired.push(hash);
    }
  }

  expired.forEach((hash) => submissionCooldowns.delete(hash));
}

// Clean expired cooldowns every minute
setInterval(cleanExpiredCooldowns, 60 * 1000);

export const leaderboardRoutes = new Elysia({ prefix: "/leaderboard" })
  // Submit score to leaderboard
  .post(
    "/submit",
    ({ body, set }) => {
      const { sessionId, name } = body;

      // Validate name
      if (!name || name.trim().length === 0) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "Name is required and cannot be empty",
        };
      }

      if (name.length > 50) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "Name must be 50 characters or less",
        };
      }

      // Get session
      const session = activeSessions.get(sessionId);
      if (!session) {
        set.status = 404;
        return {
          error: "Session Not Found",
          message: "Invalid or expired session",
        };
      }

      // Check deduplication
      const hash = createSubmissionHash(sessionId, name);
      if (!canSubmit(hash)) {
        const lastSubmission = submissionCooldowns.get(hash);
        const timeRemaining = COOLDOWN_MS - (Date.now() - lastSubmission!);
        const minutesRemaining = Math.ceil(timeRemaining / 60000);

        set.status = 429;
        return {
          error: "Too Many Requests",
          message: `Please wait ${minutesRemaining} minute(s) before submitting again`,
        };
      }

      // Create leaderboard entry
      const entry: LeaderboardEntry = {
        name: name.trim(),
        score: session.score,
        mode: session.mode,
        timestamp: Date.now(),
      };

      // Add to leaderboard
      leaderboard.push(entry);

      // Update cooldown
      submissionCooldowns.set(hash, Date.now());

      // Sort leaderboard by score (descending) and timestamp (ascending for ties)
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timestamp - b.timestamp;
      });

      // Keep only top 100 entries
      if (leaderboard.length > 100) {
        leaderboard.splice(100);
      }

      // Find user's rank
      const userRank = leaderboard.findIndex(
        (e) => e.name === entry.name && e.timestamp === entry.timestamp
      );

      return {
        success: true,
        rank: userRank + 1,
        score: entry.score,
      };
    },
    {
      body: t.Object({
        sessionId: t.String(),
        name: t.String(),
      }),
    }
  )
  // Get top leaderboard entries
  .get(
    "/top",
    ({ query }) => {
      const limit = Math.min(query.limit || 10, 100); // Max 100 entries
      const mode = query.mode;

      let entries = leaderboard;

      // Filter by mode if specified
      if (mode && mode !== "all") {
        entries = entries.filter((e) => e.mode === mode);
      }

      // Return top entries
      const topEntries = entries.slice(0, limit);

      const response: LeaderboardResponse = {
        entries: topEntries,
      };

      return response;
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        mode: t.Optional(t.String()),
      }),
    }
  );
