# QuickBeats

Fast, minimalist music guessing game. Guess songs from 5-second clips!

## Getting Started

This is a monorepo containing:
- `client/` - Next.js frontend
- `server/` - Elysia backend

### Prerequisites

- [Bun](https://bun.sh) (required)

### Installation

```bash
# Install all dependencies
bun install
```

### Development

```bash
# Run both frontend and backend in development mode
bun dev

# Or run individually:
bun dev:client   # Frontend only
bun dev:server   # Backend only
```

### Build

```bash
# Build all packages
bun build
```

### Production

```bash
# Start production servers
bun start
```

## Project Structure

```
quickbeats/
├── client/      # Frontend (Next.js + Tailwind + SeraUI)
├── server/      # Backend (Elysia + Bun)
├── specs/       # Project requirements and design docs
└── package.json # Monorepo workspace config
```

## License

MIT
