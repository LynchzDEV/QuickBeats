import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { SpotifyClient } from "../lib/spotify";
import { selectTrackWithPreview, createGameRound, mapSpotifyTrack } from "../lib/gameLogic";
import type { GameSession } from "../types/game";
import { env } from "../config/env";
import { activeSessions } from "../lib/sessionStore";
import { metrics } from "../lib/metrics";

export const gameRoutes = new Elysia({ prefix: "/game" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: env.SESSION_SECRET || "your-secret-key-change-this",
    })
  )
  // Create new game session
  .post(
    "/session",
    async ({ body, cookie: { session }, jwt, set }) => {
      const { mode, artistId, playlistId, source } = body;

      // Validate mode
      const validModes = ["artist", "top-tracks", "saved-tracks", "playlist"];
      if (!validModes.includes(mode)) {
        set.status = 400;
        return {
          error: "Bad Request",
          message: `Invalid mode. Must be one of: ${validModes.join(", ")}`,
        };
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let spotifyTracks: any[] = [];
        let sourceIdentifier: string;

        // All modes now require user authentication to get preview URLs
        // Verify user authentication
        if (!session.value) {
          set.status = 401;
          return {
            error: "Unauthorized",
            message: "Spotify authentication required to access preview URLs",
          };
        }

        // Decode JWT session
        const payload = await jwt.verify(session.value);
        if (!payload || !payload.accessToken) {
          set.status = 401;
          return {
            error: "Unauthorized",
            message: "Invalid or expired session",
          };
        }

        const accessToken = payload.accessToken;
        const client = new SpotifyClient(accessToken);

        // Handle artist mode
        if (mode === "artist") {
          if (!artistId) {
            set.status = 400;
            return {
              error: "Bad Request",
              message: "artistId is required for artist mode",
            };
          }

          // Get artist's top tracks using user token (provides preview URLs)
          const response = await client.getArtistTopTracks(artistId);
          spotifyTracks = response.tracks || [];
          sourceIdentifier = artistId;
        }
        // Handle personal modes
        else {
          // Fetch tracks based on mode
          if (mode === "top-tracks") {
            const timeRange = source || "medium_term"; // short_term, medium_term, long_term
            const response = await client.getUserTopTracks(50, timeRange);
            spotifyTracks = response.items || [];
            sourceIdentifier = `top-tracks-${timeRange}`;
          } else if (mode === "saved-tracks") {
            const response = await client.getUserSavedTracks(50);
            // Saved tracks response has items with { track: {...} } structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spotifyTracks = (response.items || []).map((item: any) => item.track);
            sourceIdentifier = "saved-tracks";
          } else if (mode === "playlist") {
            if (!playlistId) {
              set.status = 400;
              return {
                error: "Bad Request",
                message: "playlistId is required for playlist mode",
              };
            }

            const response = await client.getPlaylistTracks(playlistId);
            // Playlist tracks response has items with { track: {...} } structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spotifyTracks = (response.items || []).map((item: any) => item.track);
            sourceIdentifier = playlistId;
          }
        }

        // Convert to our Track type
        const tracks = spotifyTracks.map(mapSpotifyTrack);

        // Select a track with preview
        const selectedTrack = selectTrackWithPreview(tracks);

        if (!selectedTrack) {
          set.status = 404;
          return {
            error: "No Preview Available",
            message: "No tracks with preview URLs found for this source",
          };
        }

        // Create game round
        const secret = env.SESSION_SECRET || "your-secret-key-change-this";
        const round = await createGameRound(selectedTrack, sourceIdentifier, secret);

        // Create session
        const sessionId = crypto.randomUUID();
        activeSessions.set(sessionId, {
          mode,
          score: 0,
          roundsPlayed: 0,
          currentRoundId: round.roundId,
          correctAnswerId: selectedTrack.id,
        });

        // Record game start in metrics
        metrics.recordGameStart(mode);

        const gameSession: GameSession = {
          sessionId,
          mode: mode as "artist" | "personal",
          round,
          score: 0,
          roundsPlayed: 0,
        };

        return gameSession;
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
        playlistId: t.Optional(t.String()),
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
