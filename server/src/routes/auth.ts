import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { SpotifyClient } from "../lib/spotify";
import { env } from "../config/env";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: env.SESSION_SECRET || "your-secret-key-change-this",
    })
  )
  // Start Spotify OAuth flow
  .get("/spotify/start", ({ cookie: { oauth_state }, set }) => {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in cookie for validation
    oauth_state.set({
      value: state,
      httpOnly: true,
      maxAge: 600, // 10 minutes
      sameSite: "lax",
    });

    // Redirect to Spotify authorization
    const authUrl = SpotifyClient.getAuthUrl(state);
    set.redirect = authUrl;
  })
  // Handle Spotify OAuth callback
  .get(
    "/spotify/callback",
    async ({ query, cookie: { oauth_state, session }, jwt, set }) => {
      const { code, state, error } = query;

      // Handle authorization errors
      if (error) {
        return {
          error: "Authorization failed",
          message: error,
        };
      }

      // Validate state parameter (CSRF protection)
      if (!state || state !== oauth_state.value) {
        set.status = 400;
        return {
          error: "Invalid state",
          message: "State mismatch - possible CSRF attack",
        };
      }

      // Clear state cookie
      oauth_state.remove();

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
        set.redirect = `http://localhost:3000?auth=success`;
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
