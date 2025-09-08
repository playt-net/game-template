# Game Template

## Features
- [Elysia](https://elysiajs.com/)
- [Bun](https://bun.sh/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)


## Getting Started
```bash
bun i
```

## Environment Variables

Before starting the development server, you need to set up the following environment variables:

### API_KEY
This is a ClashParadise API key. You can:
- Use an existing key from `.env.games`
- Create a new game in the dev console to generate a new API key

### AXIOM_TOKEN
This token needs to be retrieved from Axiom for logging and analytics.

Make sure to create a `.env` or `.env.local` file in the root directory with these variables before running the application.

To start the development server run:
```bash
bun run dev:all
```

The repo is divided into three parts:
- Game
- Frontend
- Server

The game is built with [Phaser](https://phaser.io/) and the frontend is built with [React](https://react.dev/).

The server is built with [Elysia](https://elysiajs.com/) and is used to handle the game logic and verify the user's moves and game state.

To communicate between the frontend and the backend, we use WebSocket and HTTP requests.

To communicate between the Game and the frontend, you should use the EventBus or expose functions through the GameRef.

## Deployment

The template is ready to be deployed to our coolify using nixpacks.