---
project_name: QuickBeats
file_purpose: design.md — Technical blueprint describing how to build it (how)
status: approved-blueprint
ai_instruction: Follow this blueprint when implementing; update here if technical decisions change (then reflect back into tasks and changelog).
---

# QuickBeats — Technical Design

## 1. Architecture Overview
- **FE (Next.js, TS, Tailwind, SeraUI)** serves UI, handles OAuth start, game state, audio playback, and local name.
- **BE (Elysia, TS on Bun)** exposes REST endpoints for:
  - Auth callback & token exchange (server-side).
  - Artist search & track sampling (server-cached).
  - Personal mode sources (top tracks, playlists) using user tokens.
  - Game session creation, answer validation, scoring.
  - Leaderboard submission, listing, and deduplication.
  - Global metrics (total quizzes played).

### 1.1 High-Level Flow
1. **Main Page:** FE calls `GET /metrics/summary` to show total quizzes played.
2. **Artist Mode:** FE requests `POST /game/session` with `{ mode: "artist", artistId }`. BE returns a track with `preview_url` and three choices.
3. **Personal Mode:** FE starts OAuth → callback to BE → FE requests `POST /game/session` with `{ mode: "personal", source: "top|playlist|saved" }`.
4. **Round:** FE plays a 5s slice (see §3) then posts answer to `POST /game/answer`. BE validates and returns updated score/state.
5. **Finish:** FE posts to `/leaderboard/submit` with name and score; BE dedupes and stores; FE fetches `/leaderboard/top`.

## 2. Tech Stack Details
- **Frontend**
  - Next.js App Router, TypeScript, Tailwind + SeraUI components.
  - State: lightweight (React state + `useReducer` or Zustand) for game flow.
  - Audio: HTMLAudioElement; preloading next clip where possible.
  - Storage: `localStorage` for display name and preferences.
- **Backend**
  - Elysia with typed routes; Zod for DTO validation.
  - HTTP client to Spotify with token refresh.
  - Caching: in-memory LRU (MVP) with TTL for artist search/results; upgradeable to Redis.
  - Persistence: SQLite or Postgres (scores, sessions, metrics). Use Prisma for schema.
  - Rate limiting: token bucket (per IP/device hash).
- **Build/Run**
  - **bun** scripts (`bun dev`, `bun start`, `bun test`).
  - Dockerfiles (optional later).

## 3. Audio Strategy (Policy-Friendly)
- Use Spotify `preview_url` (≈30s). If absent, **skip track**.
- **Random 5s window:**
  - Get preview duration `D`; choose `start = random(0, max(0, D - 5.0))`.
  - Set `audio.currentTime = start`; play for 5s; then pause & reveal choices.
- Preload next round’s audio while user is answering (opt-in to avoid auto-play issues).

## 4. Game Logic
- **Choices:** Always 3: 1 correct + 2 distractors (same artist/genre if possible).
- **Scoring:** +1 for correct; optional streak bonus later.
- **Session:** Server generates a signed `roundId` with correct answer hash; client never receives raw truth until answer submission response.
- **Duplicates Minimization:** Leaderboard entry key = hash(deviceId + normalizedName). When same score & key repeats within a cooldown window, keep best timestamp only.

## 5. API (Initial)
- `GET /health` → `{ ok: true }`
- `GET /metrics/summary` → `{ totalQuizzes }`
- `POST /auth/spotify/start` → 302 to Spotify (FE usually hits this URL)
- `GET /auth/spotify/callback` → sets httpOnly session; redirects to FE
- `GET /artists/search?q=` → list of artists
- `POST /game/session` → body `{ mode, artistId?, source? }` → `{ sessionId, round }`
- `POST /game/answer` → body `{ sessionId, roundId, choiceId }` → `{ correct, score, nextRound? }`
- `POST /leaderboard/submit` → `{ name, score, deviceHint }` → `{ rank }`
- `GET /leaderboard/top?limit=50` → top entries

_All endpoints validated with Zod; responses typed._

## 6. Data Model (Prisma sketch)
```ts
model LeaderboardEntry {
  id           String   @id @default(cuid())
  deviceKey    String   @index
  displayName  String
  score        Int
  createdAt    DateTime @default(now())
}

model GameSession {
  id           String   @id @default(cuid())
  mode         String   // "artist" | "personal"
  userRef      String?  // null for guest; or hashed user id
  roundsPlayed Int      @default(0)
  score        Int      @default(0)
  createdAt    DateTime @default(now())
}

model MetricCounter {
  key   String @id // e.g., "totalQuizzes"
  value Int
}
```

## 7. Security & Privacy
- Tokens: Spotify tokens stored server-side; FE gets only a session cookie (httpOnly, SameSite=Lax).
- Cheat Mitigation: Server decides the correct answer; signed round payloads; rate limit submissions; basic anomaly checks (e.g., <500ms answer bursts).
- PII: Store minimal; allow DELETE of leaderboard entries by deviceKey+proof.

## 8. UI Design Notes
- Dark-only palette: black backgrounds, neon-green accents, subtle depth; SeraUI components styled via Tailwind tokens.
- Motion: 150–250ms transitions; focus/hover rings for accessibility.
- Responsive: Mobile-first; large tap targets for answer chips.

## 9. Observability
- Request logs (method, path, status, ms).
- Counters: total quizzes, per-mode plays, skip rate, preview-missing rate.
- Error aggregation with simple middleware.

## 10. Risks & Mitigations
- Missing preview URLs: Implement skip/replace logic; surface a toast and continue.
- Rate limits: Cache artist queries; exponential backoff; fallback messaging.
- Duplicates on leaderboard: Hashing + cooldown + timestamp tie-break.

## 11. Open for Future
- Redis cache, global daily seed, badges system, share images, i18n.
