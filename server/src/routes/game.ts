import { Elysia, t } from "elysia";
import { SpotifyClient } from "../lib/spotify";
import { selectTrackWithPreview, createGameRound, mapSpotifyTrack } from "../lib/gameLogic";
import type { GameSession } from "../types/game";
import { env } from "../config/env";

// Store active game sessions (in production, use Redis or database)
const activeSessions = new Map<
  string,
  {
    mode: string;
    score: number;
    roundsPlayed: number;
    currentRoundId: string;
    correctAnswerId: string;
  }
>();

export const gameRoutes = new Elysia({ prefix: "/game" })
  // Create new game session (Artist Mode)
  .post(
    "/session",
    async ({ body, set }) => {
      const { mode, artistId } = body;

      if (mode !== "artist") {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "Only 'artist' mode is currently supported",
        };
      }

      if (!artistId) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: "artistId is required for artist mode",
        };
      }

      try {
        // Get client credentials token
        const accessToken = await SpotifyClient.getClientCredentialsToken();
        const client = new SpotifyClient(accessToken);

        // Get artist's top tracks
        const response = await client.getArtistTopTracks(artistId);
        const spotifyTracks = response.tracks || [];

        // Convert to our Track type
        const tracks = spotifyTracks.map(mapSpotifyTrack);

        // Select a track with preview
        const selectedTrack = selectTrackWithPreview(tracks);

        if (!selectedTrack) {
          set.status = 404;
          return {
            error: "No Preview Available",
            message: "No tracks with preview URLs found for this artist",
          };
        }

        // Create game round
        const secret = env.SESSION_SECRET || "your-secret-key-change-this";
        const round = await createGameRound(selectedTrack, artistId, secret);

        // Create session
        const sessionId = crypto.randomUUID();
        activeSessions.set(sessionId, {
          mode,
          score: 0,
          roundsPlayed: 0,
          currentRoundId: round.roundId,
          correctAnswerId: selectedTrack.id,
        });

        const session: GameSession = {
          sessionId,
          mode,
          round,
          score: 0,
          roundsPlayed: 0,
        };

        return session;
      } catch (error) {
        console.error("Game session creation error:", error);
        set.status = 500;
        return {
          error: "Session Creation Failed",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        mode: t.String(),
        artistId: t.Optional(t.String()),
        source: t.Optional(t.String()),
      }),
    }
  )
  // Submit answer for current round
  .post(
    "/answer",
    async ({ body, set }) => {
      const { sessionId, roundId, choiceId } = body;

      // Get session
      const session = activeSessions.get(sessionId);
      if (!session) {
        set.status = 404;
        return {
          error: "Session Not Found",
          message: "Invalid or expired session",
        };
      }

      // Verify round ID matches current round
      if (session.currentRoundId !== roundId) {
        set.status = 400;
        return {
          error: "Invalid Round",
          message: "Round ID does not match current session round",
        };
      }

      // Check if answer is correct
      const correct = choiceId === session.correctAnswerId;

      // Update session
      session.roundsPlayed += 1;
      if (correct) {
        session.score += 1;
      }

      // Return result (no next round for now)
      return {
        correct,
        correctAnswerId: session.correctAnswerId,
        score: session.score,
        roundsPlayed: session.roundsPlayed,
      };
    },
    {
      body: t.Object({
        sessionId: t.String(),
        roundId: t.String(),
        choiceId: t.String(),
      }),
    }
  );
