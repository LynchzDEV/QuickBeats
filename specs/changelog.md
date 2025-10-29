---
project_name: QuickBeats
file_purpose: changelog.md — Append-only record of changes
status: ready
ai_instruction: After each completed task, append a dated entry here; never rewrite history, only add.
---

# Changelog

<!--
Format guideline:
- 2025-10-29: [phase/task] one-line summary; optional brief notes.

Example:
- 2025-10-29: [Phase 1] Implemented /health and logging middleware.
-->

- 2025-10-29: [Phase 0] Created monorepo structure with client and server workspaces using bun; configured package.json with workspace scripts.
- 2025-10-29: [Phase 0] Configured TypeScript strict mode, ESLint with TypeScript plugin, Prettier, and commit hooks (husky + lint-staged).
- 2025-10-29: [Phase 0] Added GitHub Actions CI workflow with lint, typecheck, build, and test jobs.
- 2025-10-29: [Phase 1] Scaffolded Elysia server with health endpoint, environment configuration using Zod, and .env.example template.
- 2025-10-29: [Phase 1] Added logging middleware for Elysia to track incoming requests with method and path.
- 2025-10-29: [Phase 1] Added error handler middleware and Elysia built-in validation with TypeBox schemas; tested with validation examples.
- 2025-10-29: [Phase 1] Implemented Spotify OAuth client with authorization flow, token exchange, refresh tokens, and auth routes (/auth/spotify/start, /auth/spotify/callback, /auth/session, /auth/logout); added cookie and JWT support.
- 2025-10-29: [Phase 1] Implemented /artists/search endpoint with LRU cache (5min TTL), client credentials token management, query validation, and automatic cache expiration cleanup.
- 2025-10-29: [Phase 1] Implemented POST /game/session (artist mode) with track selection, preview_url filtering, distractor generation, SHA-256 round signing, random 5s preview timing, and session management.
- 2025-10-29: [Phase 1] Implemented POST /game/answer with session validation, round verification, score tracking, and correct answer revelation; returns updated score and rounds played.
