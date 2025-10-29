import { Elysia } from "elysia";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

const app = new Elysia()
  .use(logger)
  .use(errorHandler)
  .get("/health", () => ({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .listen(3001);

console.log(`🚀 Server running at http://${app.server?.hostname}:${app.server?.port}`);

export default app;
