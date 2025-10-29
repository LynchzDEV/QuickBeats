import { Elysia } from "elysia";
import { logger } from "./middleware/logger";

const app = new Elysia()
  .use(logger)
  .get("/health", () => ({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .listen(3001);

console.log(`🚀 Server running at http://${app.server?.hostname}:${app.server?.port}`);

export default app;
