import { Elysia } from "elysia";

const requestTimes = new Map<string, number>();

export const logger = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;

    requestTimes.set(id, Date.now());
    (request as any).__logId = id;

    console.log(`→ ${method} ${path}`);
  })
  .onAfterHandle(({ request }) => {
    const id = (request as any).__logId;
    const start = requestTimes.get(id);
    if (start) {
      const duration = Date.now() - start;
      const method = request.method;
      const url = new URL(request.url);
      const path = url.pathname;

      console.log(`← ${method} ${path} - ${duration}ms`);
      requestTimes.delete(id);
    }
  });
