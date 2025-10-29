---
project_name: QuickBeats
file_purpose: tasks.md — Phased checklist to implement the app end-to-end
status: active
ai_instruction: Execute tasks top-to-bottom; after completing each task, append a concise entry to changelog.md.
---

# QuickBeats — Implementation Tasks

## Phase 0 — Repo & Tooling
- [x] Create monorepo or two repos (`fe`, `be`) with **bun** as package manager.
- [x] Configure TS strict, ESLint, Prettier; commit hooks (lint-staged).
- [x] Add CI skeleton (build, typecheck, lint).

## Phase 1 — Backend (Elysia)
- [ ] Scaffold Elysia app with health endpoint.
- [ ] Add Zod validation, error formatter, logging middleware.
- [ ] Spotify client: auth URLs, token exchange, refresh flow.
- [ ] Implement `/artists/search` with caching (LRU, TTL).
- [ ] Implement `/game/session` (artist mode): pick track with `preview_url`, generate 2 distractors, sign round.
- [ ] Implement `/game/answer`: validate signed round, update metrics, return correctness and next round (optional).
- [ ] Implement personal sources: top tracks, playlists, saved tracks (guarded by scopes).
- [ ] `/leaderboard/submit` with dedupe (hash key + cooldown) and `/leaderboard/top`.
- [ ] Metrics counter `/metrics/summary`.
- [ ] Prisma schema + migration (SQLite/Postgres), env parsing, docker-compose (optional).

## Phase 2 — Frontend (Next.js + Tailwind + SeraUI)
- [ ] App shell, dark theme tokens, SeraUI setup.
- [ ] Main page: two CTA cards; **total quizzes** metric.
- [ ] Artist search & pick flow (debounced typeahead).
- [ ] Game screen: timer, play 5s segment, 3 answer chips, feedback states.
- [ ] End screen: score summary, local name capture, submit to leaderboard.
- [ ] Leaderboard page: top entries, tie-handling visuals.
- [ ] OAuth start/callback wiring for Spotify mode; mode selector for sources.

## Phase 3 — Quality & Guardrails
- [ ] Basic unit tests (route validators, choice generator, dedupe logic).
- [ ] E2E happy path (Artist mode, Personal mode).
- [ ] Accessibility pass (keyboard focus, contrast).
- [ ] Rate limiting & basic anti-cheat checks.
- [ ] Empty-state and error UX (no preview available).

## Phase 4 — Performance & Polish
- [ ] Preload next audio clip where policy allows.
- [ ] Image/icon optimization; bundle analysis.
- [ ] Observability dashboards (logs + counters).
- [ ] Content & branding checklist (attribution, scopes).

## Delivery Checklist
- [ ] All acceptance criteria from requirements.md satisfied.
- [ ] Smoke tests across desktop/mobile Chromium/WebKit/Gecko.
- [ ] Final runbook and environment sample `.env.example`.

## Post-Launch (Backlog)
- [ ] Daily challenge seed.
- [ ] Badges & streaks.
- [ ] Share cards (OG images).
