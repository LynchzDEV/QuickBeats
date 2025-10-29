import { Elysia, t } from "elysia";

// Test route to demonstrate Zod validation
export const testRoutes = new Elysia({ prefix: "/test" })
  .post(
    "/validate",
    ({ body }) => {
      return {
        success: true,
        data: body,
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        email: t.String({ format: "email" }),
        age: t.Optional(t.Number({ minimum: 0, maximum: 150 })),
      }),
    }
  )
  .get("/error", () => {
    throw new Error("This is a test error");
  });
