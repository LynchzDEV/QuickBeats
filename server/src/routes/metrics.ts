import { Elysia } from "elysia";
import { metrics } from "../lib/metrics";

export const metricsRoutes = new Elysia({ prefix: "/metrics" })
  // Get metrics summary
  .get("/summary", () => {
    return metrics.getSummary();
  });
