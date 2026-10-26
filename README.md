<p align="center">
  <img src="branding/logo-dark.png" alt="Lorentzburn" width="640">
</p>

# Lorentzburn

A spaceship-themed (inspired by The Expanse book series), Battleship-style strategy game built as a learning project exploring both algorithmic and LLM-based AI opponent design.

## Overview

Lorentzburn pits the player against two distinct AI opponents:

- **Heuristic AI**, a probability-density targeting algorithm, no external dependencies
- **LLM AI**, an opponent powered by the Claude API, reasoning over board state each turn

Multiplayer (Node.js + Socket.io) is planned as a later phase.

## Tech Stack

- **Frontend**: React + Tailwind CSS (Vite)
- **Core Engine**: Framework-agnostic TypeScript module (`/engine`)
- **AI Opponents**: Heuristic probability algorithm + Claude API integration
- **Multiplayer** *(planned)*: Node.js + Socket.io

## Project Structure

```
lorentzburn/
├── engine/      # Core game logic (board, ships, attack resolution)
├── frontend/    # React application
└── README.md
```

## Status

Early development, core game engine in progress.

## Getting Started

Run all commands from the repo root. It's an npm workspaces monorepo, so a single install covers both `engine` and `frontend`.

```bash
npm install              # install dependencies for all workspaces
npm run dev -w frontend  # build the engine, then start the Vite dev server
```

Then open the URL Vite prints (usually http://localhost:5173).

The frontend's `predev` / `prebuild` hooks compile the engine automatically, so there's no separate engine build step.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run build -w frontend` | Production build (engine + frontend) into `frontend/dist` |
| `npm run preview -w frontend` | Serve the production build locally |
| `npm test -w engine` | Run the engine test suite (Vitest) |
| `npm run test:watch -w engine` | Run engine tests in watch mode |
| `npm run lint` | Lint the engine source |
| `npm run format` | Format the repo with Prettier |

## License

ISC