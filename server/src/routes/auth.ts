import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { SpotifyClient } from "../lib/spotify";
import { env } from "../config/env";
import { oauthStateStore } from "../lib/oauthStateStore";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: env.SESSION_SECRET || "your-secret-key-change-this",
    })
  )
  // Start Spotify OAuth flow
  .get("/spotify/start", ({ set }) => {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();

    // Store state server-side (works across localhost and ngrok)
    oauthStateStore.set(state, state, 10 * 60 * 1000); // 10 minutes

    // Redirect to Spotify authorization
    const authUrl = SpotifyClient.getAuthUrl(state);
    set.redirect = authUrl;
    return;
  })
  // Handle Spotify OAuth callback
  .get(
    "/spotify/callback",
    async ({ query, cookie: { session }, jwt, set }) => {
      const { code, state, error } = query;

      // Handle authorization errors
      if (error) {
        return {
          error: "Authorization failed",
          message: error,
        };
      }

      // Validate state parameter (CSRF protection)
      const storedState = state ? oauthStateStore.get(state) : null;
      if (!state || !storedState || state !== storedState) {
        set.status = 400;
        return {
          error: "Invalid state",
          message: "State mismatch - possible CSRF attack",
        };
      }

      // Clear state from store
      oauthStateStore.delete(state);

      // Exchange code for tokens
      try {
        const tokenResponse = await SpotifyClient.exchangeCodeForToken(code);

        // Create JWT session with Spotify tokens
        const sessionToken = await jwt.sign({
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        });

        // Store session in httpOnly cookie
        session.set({
          value: sessionToken,
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60, // 7 days
          sameSite: "lax",
          path: "/",
        });

        // Redirect to frontend with success
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        set.redirect = `${frontendUrl}?auth=success`;
        return;
      } catch (err) {
        console.error("Token exchange error:", err);
        set.status = 500;
        return {
          error: "Token exchange failed",
          message: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    {
      query: t.Object({
        code: t.String(),
        state: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    }
  )
  // Get current session info
  .get("/session", async ({ cookie: { session }, jwt, set }) => {
    if (!session.value) {
      set.status = 401;
      return { authenticated: false };
    }

    try {
      const payload = await jwt.verify(session.value);
      if (!payload) {
        set.status = 401;
        return { authenticated: false };
      }

      return {
        authenticated: true,
        expiresAt: payload.expiresAt,
      };
    } catch (err) {
      set.status = 401;
      return { authenticated: false };
    }
  })
  // Logout
  .post("/logout", ({ cookie: { session } }) => {
    session.remove();
    return { success: true };
  });
