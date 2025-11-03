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
- 2025-10-29: [Phase 1] Implemented personal game sources (top-tracks, saved-tracks, playlist) with JWT session authentication, scope guards, and support for different Spotify API response formats; extended /game/session to handle multiple modes.
- 2025-10-29: [Phase 1] Implemented leaderboard with POST /leaderboard/submit (5-minute cooldown deduplication) and GET /leaderboard/top (mode filter support); created shared session storage, automatic cooldown cleanup, and top 100 ranking with tie-handling.
- 2025-10-29: [Phase 1] Implemented metrics tracking system with GET /metrics/summary; tracks total games played by mode, score submissions with average/top score, unique players count; integrated with game sessions and leaderboard.
- 2025-10-29: [Phase 2] Initialized Next.js 14 frontend with App Router, Tailwind CSS dark theme, and homepage with two CTA cards (Artist Mode, Personal Mode); displays total quizzes played metric from backend API.
- 2025-11-03: [Phase 2] Implemented artist search page with debounced typeahead (300ms), Spotify API integration, artist cards with images/genres, loading/error states, and navigation to game; created API client with typed interfaces.
- 2025-11-03: [Phase 2] Implemented game screen with 5-second countdown timer, automatic audio preview playback, album art display, three answer chips with hover states, real-time answer submission, visual feedback (green/red borders, icons), and session data management via sessionStorage.
- 2025-11-03: [Phase 2] Implemented end screen with score summary, percentage calculation, performance messages, player name input, leaderboard submission with validation/error handling, success confirmation with rank display, and action buttons (Play Again, View Leaderboard).
- 2025-11-03: [Phase 2] Implemented leaderboard page with top 50 scores, mode filter tabs, medal emojis for top 3, relative timestamp formatting, rank highlighting, empty/loading/error states, and mobile-responsive table design.
- 2025-11-03: [Docs] Enhanced README with comprehensive documentation including setup instructions, Spotify API configuration, project structure, API endpoints reference, game flow description, and development tools.
- 2025-11-03: [Phase 2] Implemented personal mode page with Spotify OAuth integration, authentication check, mode selector cards (top tracks/saved tracks/playlist), time range options, playlist ID input, and beautiful Spotify-branded UI; updated API client with cookie-based auth support.
