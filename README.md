# QuickBeats 🎵

A music guessing game where you listen to 5-second song clips and guess the track name. Test your music knowledge with your favorite artists or your personal Spotify library!

## Features

- **Artist Mode**: Search for any artist and guess songs from their catalog
- **Personal Mode**: Play with your Spotify top tracks, saved songs, or playlists (requires Spotify login)
- **Real-time Leaderboard**: Compete with other players and track your ranking
- **Metrics Dashboard**: View total games played and statistics
- **Dark Theme**: Beautiful dark mode interface

## Tech Stack

- **Backend**: Bun + Elysia + TypeScript + Spotify Web API
- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Monorepo**: Bun workspaces

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- Spotify Developer Account (for API credentials)

### Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure Spotify API**

   Create `server/.env`:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/spotify/callback
   SESSION_SECRET=your_random_secret_key
   ```

   Get credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
   - Create a new app
   - Add redirect URI: `http://localhost:3001/auth/spotify/callback`
   - Copy Client ID and Client Secret

3. **Start development servers**

   Backend (port 3001):

   ```bash
   bun --cwd server dev
   ```

   Frontend (port 3002):

   ```bash
   bun --cwd client dev
   ```

4. **Open the app**

   Navigate to [http://localhost:3002](http://localhost:3002)

## Project Structure

```
QuickBeats/
├── server/              # Backend (Elysia + Spotify API)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── lib/         # Game logic, caching, metrics
│   │   ├── middleware/  # Logging, error handling
│   │   └── types/       # TypeScript interfaces
│   └── .env             # Environment variables
├── client/              # Frontend (Next.js + Tailwind)
│   ├── app/             # App Router pages
│   │   ├── page.tsx     # Homepage
│   │   ├── artist/      # Artist search
│   │   ├── game/        # Game screen
│   │   ├── end/         # End screen
│   │   └── leaderboard/ # Leaderboard
│   └── lib/             # API clients
└── specs/               # Requirements & design docs
```

## API Endpoints

- `POST /game/session` - Create game session
- `POST /game/answer` - Submit answer
- `GET /artists/search` - Search artists
- `POST /leaderboard/submit` - Submit score
- `GET /leaderboard/top` - Get top scores
- `GET /metrics/summary` - Game statistics
- `GET /auth/spotify/start` - OAuth flow
- `GET /health` - Health check

## Scripts

```bash
bun lint          # Run ESLint
bun lint:fix      # Fix linting issues
bun typecheck     # TypeScript check
bun build         # Build all packages
```

## Game Flow

1. **Artist Mode**: Search artist → Start game → Listen to 5s clips → Guess songs → Submit score
2. **Personal Mode**: Login with Spotify → Select source (top tracks/saved/playlists) → Play game

## Development

- Pre-commit hooks with Husky + lint-staged
- TypeScript strict mode
- ESLint + Prettier
- GitHub Actions CI

## License

MIT
