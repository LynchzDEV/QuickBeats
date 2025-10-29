import { Elysia } from "elysia";

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  ({ code, error, set }) => {
    console.error(`Error [${code}]:`, error.message);

    // Handle different error types
    switch (code) {
      case "VALIDATION":
        set.status = 400;
        return {
          error: "Validation Error",
          message: error.message,
          code: "VALIDATION_ERROR",
        };

      case "NOT_FOUND":
        set.status = 404;
        return {
          error: "Not Found",
          message: error.message || "Resource not found",
          code: "NOT_FOUND",
        };

      case "PARSE":
        set.status = 400;
        return {
          error: "Parse Error",
          message: "Invalid request body",
          code: "PARSE_ERROR",
        };

      case "INTERNAL_SERVER_ERROR":
        set.status = 500;
        return {
          error: "Internal Server Error",
          message: "An unexpected error occurred",
          code: "INTERNAL_SERVER_ERROR",
        };

      default:
        set.status = 500;
        return {
          error: "Unknown Error",
          message: error.message || "An unexpected error occurred",
          code: code || "UNKNOWN_ERROR",
        };
    }
  }
);
