import { Elysia, t } from "elysia";
import { SpotifyClient } from "../lib/spotify";
import { LRUCache } from "../lib/cache";

// Cache artist search results for 5 minutes
const searchCache = new LRUCache<string, unknown>(100, 5 * 60 * 1000);

// Clean expired cache entries every 10 minutes
setInterval(
  () => {
    const removed = searchCache.cleanExpired();
    if (removed > 0) {
      console.log(`Cleaned ${removed} expired cache entries`);
    }
  },
  10 * 60 * 1000
);

export const artistRoutes = new Elysia({ prefix: "/artists" }).get(
  "/search",
  async ({ query, set }) => {
    const { q } = query;

    if (!q || q.trim().length === 0) {
      set.status = 400;
      return {
        error: "Bad Request",
        message: "Query parameter 'q' is required",
      };
    }

    // Check cache first
    const cacheKey = `search:${q.toLowerCase().trim()}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return {
        results: cached,
        cached: true,
      };
    }

    // Use client credentials flow for public artist search
    try {
      const accessToken = await SpotifyClient.getClientCredentialsToken();
      const client = new SpotifyClient(accessToken);

      const limit = query.limit || 10;
      const result = await client.searchArtists(q.trim(), limit);

      // Cache the results
      searchCache.set(cacheKey, result);

      return {
        results: result,
        cached: false,
      };
    } catch (error) {
      console.error("Artist search error:", error);
      set.status = 500;
      return {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    query: t.Object({
      q: t.String({ minLength: 1 }),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
    }),
  }
);
