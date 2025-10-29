import { Elysia } from "elysia";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/auth";
import { artistRoutes } from "./routes/artists";
import { gameRoutes } from "./routes/game";
import { leaderboardRoutes } from "./routes/leaderboard";
import { metricsRoutes } from "./routes/metrics";

const app = new Elysia()
  .use(logger)
  .use(errorHandler)
  .get("/health", () => ({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .use(authRoutes)
  .use(artistRoutes)
  .use(gameRoutes)
  .use(leaderboardRoutes)
  .use(metricsRoutes)
  .listen(3001);

console.log(`🚀 Server running at http://${app.server?.hostname}:${app.server?.port}`);

export default app;
