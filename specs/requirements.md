---
project_name: QuickBeats
file_purpose: requirements.md — Approved source of truth for the product (what/why)
status: approved
ai_instruction: Treat this file as canonical; all other specs must align with these requirements.
---

# QuickBeats — Product Requirements

## 1. Vision & Goals
- **Vision:** Deliver a fast, minimalist, Apple-like web game where players guess songs from a 5-second clip.
- **Primary Goal:** Make music discovery playful while respecting streaming/API policies (use preview clips).
- **Success Criteria:** High session completion rate, low abandon after first round, and active leaderboard participation.

## 2. Core User Stories
1. **Play without account (Artist Mode):**
   As a guest, I select a singer/band and play multiple rounds of 5-second clips, choosing from 3 options.
2. **Play with Spotify (Personal Mode):**
   As a Spotify user, I sign in and play using my playlists or top tracks with the same 5-second guessing mechanic.
3. **Leaderboard & Identity:**
   As a player, I enter a display name (stored on my device) and submit my score to a global leaderboard with minimal duplicates.
4. **Replayability:**
   As a player, I can quickly replay rounds and see my cumulative statistics and total quizzes played on the main page.

## 3. Features (Must/Should/Could)
- **Must**
  - Main page with two modes: **Artist Mode** and **Spotify Mode**; show **total quizzes played** (global counter).
  - Game flow: random 5-second clip (random segment from an available preview), then show **3 choices** (title + small icon).
  - Answer validation, scoring, streaks, and end-of-game summary.
  - Leaderboard submission with client-stored display name; server-side dedupe to reduce duplicate scores.
  - Dark mode only; green-neon on black aesthetic; minimalist, Apple-like.
- **Should**
  - Anti-cheat basics: server validates the ground truth; rate limits on submissions.
  - Artist search and autocomplete; recent selections history.
  - Personal Mode sources: **Top Tracks**, **Saved Tracks**, and **Selected Playlist** (if permitted by scopes).
- **Could**
  - Daily challenge seed (same across users per day).
  - Badges for streaks and accuracy milestones.
  - Shareable result cards.

## 4. Non-Goals / Out of Scope
- Streaming full tracks beyond preview; downloading media; offline playback.
- Complex social graph or friend lists at launch.

## 5. Constraints & Policies
- **Spotify Web API:** use `preview_url` where available (typically ~30s); QuickBeats plays **5s** from a random offset within that preview.
- **Scopes (indicative):** `user-read-email`, `user-top-read`, `playlist-read-private` (if accessing private playlists).
- **Compliance:** Respect rate limits, attribution, and branding guidelines.

## 6. Target Platforms & Tech Preferences
- **Frontend:** Next.js (TypeScript), Tailwind CSS, **SeraUI** (https://seraui.com/), dark mode only.
- **Backend:** Elysia (Node/Bun, TypeScript) for API, auth callback, and game logic.
- **Build/Run:** Prefer **bun** over npm; Mac-friendly scripts.

## 7. UX Requirements
- **Theme:** Apple-like, minimalist; neon-green on black; soft shadows, smooth transitions.
- **Main Page:** Two large CTAs (Artist Mode, Spotify Sign-In), total quizzes played, brief how-it-works.
- **Game UI:** Centered timer, waveform/progress micro-bar, three answer chips, quick feedback states.
- **Leaderboard:** Submit name (persist locally), ranked table with ties de-emphasized; duplicate-score minimization.

## 8. Data & Privacy
- Client only stores: display name, recent artists, last mode, and local stats.
- Server stores: minimal session records, anonymized leaderboard entries (hashed device key + name).
- No sensitive personal data beyond OAuth basics; GDPR-style “delete my score” endpoint.

## 9. Reliability & Performance
- First interactive < 2s on broadband; audio loads pre-round.
- Backend p95 API under 300ms for cached selections.
- Graceful fallback when no `preview_url` available (skip/replace track).

## 10. Acceptance Criteria (Launch)
- Playable end-to-end in both modes with correct scoring.
- Leaderboard submission with effective dedupe.
- Works on modern desktop and mobile browsers.
- All scopes, branding, and API usage compliant.
