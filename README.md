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

```bash
npm install
```

More setup instructions coming as the project develops.

## License

ISC