# Game Template - Complete Development Guide

A comprehensive Phaser 3 + React + TypeScript game template with WebSocket communication, designed for rapid game development with the Playt platform integration.

## 🏗️ Architecture Overview

This template provides a full-stack game development architecture with clear separation of concerns:

```
📁 Project Structure
├── 🎯 src/client/           # React frontend with Phaser integration
├── 🔧 src/server/           # Bun/Elysia backend API
├── 🎮 src/game/             # Phaser game engine components
├── 🤝 src/shared/           # Shared types and utilities
└── 📦 public/               # Static assets (sounds, images)
```

### Core Technologies
- **Frontend**: React 19 + Vite + TypeScript + Phaser 3
- **Backend**: Bun + Elysia + TypeScript
- **Communication**: WebSockets + REST API
- **Styling**: TailwindCSS 4
- **Code Quality**: Biome (linting & formatting)
- **Platform Integration**: @playt/client

### CORS Configuration

The template includes automatic CORS handling for development (don't commit this code within the server.ts):

- **Development**: Allows connections from `localhost:8000` and `127.0.0.1:8000` (Vite dev server)
- **Methods**: Enables GET, POST, PUT, DELETE, and OPTIONS requests

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)

### Installation & Development

```bash
# Clone and setup
git clone <your-repo>
cd game-template
bun install

# Development (runs both client and server)
bun run dev:all

# Or run separately:
bun run dev:client  # Vite dev server on :8000
bun run dev:server  # Bun server on :3000
```

### Production Build & Deploy

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 🌍 Environment Variables Guide

### Required Environment Variables

#### For Development (.env.local)
```bash
# Playt Platform Configuration (Where your clashparadise instance runs)
VITE_CLASH_PARADISE_API_HOST_URL=http://localhost:4000  # Playt API endpoint
API_KEY=your_api_key_here           # Get from .env.games file in code Dashboard

# Development Tools
ENABLE_CORS=true                    # Enable CORS for local development
VITE_USE_MOCK_CLIENT=true           # Use mock client instead of Playt (for standalone testing)

# Optional: Production Logging & Error Tracking 
AXIOM_TOKEN=your_axiom_token        # For production logging
```

#### For Production Deployment
```bash
# Set these within coolify
VITE_CLASH_PARADISE_API_HOST_URL=https://clashparadise.io
API_KEY=your_production_api_game_api_key

# Logging & Monitoring (Required for Production)
AXIOM_TOKEN=your_axiom_token
```

### Where to Get Environment Variables

1. **VITE_CLASH_PARADISE_API_HOST_URL**: 
   - Development: `http://localhost:4000`
   - Production: `https://clashparadise.io`

2. **API_KEY** (dev): 
   - Get from [Playt Developer Console][http://localhost:4000/devs]
   - Edit existing game and update API Key (or locally from .eng.games)

2. **API_KEY** (prod): 
   - Get from [Playt Developer Console][https://clashparadise.io/devs]
   - Create new game and update API Key (or locally from .eng.games)

3. **ENABLE_CORS** (Development Only):
   - Set to `true` to enable CORS headers for local development
   - Allows connections from `localhost:8000` and `127.0.0.1:8000`
   - **Important**: Do not commit CORS code to production

4. **VITE_USE_MOCK_CLIENT** (Development Only):
   - Set to `true` to use the mock client instead of the Playt platform
   - Useful for standalone testing without needing Playt infrastructure
   - Mock client simulates WebSocket and API responses
   - Automatically enabled if `playerToken` is missing from URL

5. **AXIOM_TOKEN** (Production Recommended):
   - Sign up at [Axiom.co](https://axiom.co)
   - Create a dataset (e.g., `your-game-name-prod`)
   - Create an API token with "Ingest" permission
   - Update dataset name in `src/server/server.ts`
   - Used for production logging and analytics

6. **SENTRY_DSN** (Production Recommended):
   - Sign up at [Sentry.io](https://sentry.io)
   - Create a new "Node" project for backend
   - Copy the DSN from project settings
   - Used for error tracking


See the [Deployment section](#-deployment) for detailed setup instructions.

## 🎮 Game Development Guide

### Creating Game Scenes

The template uses Phaser 3 scenes for game logic. Here's how to create a new scene:

```typescript
// src/game/scenes/GameScene.ts
import { Scene } from 'phaser';
import { EventBus } from '@game/EventBus';
import api from '@client/client';

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        EventBus.emit('current-scene-ready', 'GameScene');
    }

    preload() {
        // Load assets
        this.load.image('player', 'player.png');
        this.load.audio('jump', 'jump.ogg');
    }

    create() {
        // Initialize game objects
        const player = this.add.image(400, 300, 'player');
        
        // Setup game logic
        this.setupControls();
        this.setupWebSocketListeners();
    }

    private setupWebSocketListeners() {
        api.ws.subscribe((message) => {
            if (message.type === 'gameUpdate') {
                this.handleGameUpdate(message);
            }
        });
    }
}
```

### Registering New Scenes

Add your scene to the game configuration:

```typescript
// src/game/Game.ts
import { GameScene } from './scenes/GameScene';

export const createGame = (containerId: string) => {
    return new PhaserGame({
        // ... existing config
        scene: [LoadingScene, GameScene], // Add your scene here
    });
};
```

### Client-Server Communication

The template supports both WebSocket and HTTP communication patterns.

#### WebSocket Communication (Real-time)

**Client Side (React/Phaser):**
```typescript
// src/client/client.ts - WebSocket setup
import api from '@client/client';

// Send message to server
api.ws.send({
    type: 'playerMove',
    playerToken: 'player_123',
    direction: 'up',
    position: { x: 100, y: 200 }
});

// Listen for server messages
api.ws.subscribe((message) => {
    switch (message.type) {
        case 'gameUpdate':
            handleGameUpdate(message.data);
            break;
        case 'playerJoined':
            handlePlayerJoined(message.player);
            break;
    }
});
```

**Server Side (Elysia):**
```typescript
// src/server/router/game.ts - WebSocket handler
.ws("/:playerToken", {
    message: async (ws, message) => {
        const { type, playerToken } = message;
        
        switch (type) {
            case 'playerMove':
                // Update game state
                const gameState = updatePlayerPosition(message);
                
                // Broadcast to all players
                ws.publish('game-room', {
                    type: 'gameUpdate',
                    state: gameState
                });
                break;
                
            case 'joinGame':
                ws.subscribe('game-room');
                ws.send({
                    type: 'playerJoined',
                    player: getPlayerData(playerToken)
                });
                break;
        }
    },
    body: t.Union([
        t.Object({
            type: t.Literal('playerMove'),
            playerToken: t.String(),
            direction: t.String(),
            position: t.Object({
                x: t.Number(),
                y: t.Number()
            })
        }),
        t.Object({
            type: t.Literal('joinGame'),
            playerToken: t.String()
        })
    ])
})
```

#### HTTP API Communication (Request/Response)

**Client Side:**
```typescript
// src/client/client.ts - HTTP requests
import api from '@client/client';

// Get match data
const matchData = await api.getMatch();

// Custom API call
const gameStats = await client.api.stats({ playerToken }).get();

// Post game results
await client.api.results({ playerToken }).post({
    score: 1500,
    level: 5,
    achievements: ['first_win']
});
```

**Server Side:**
```typescript
// src/server/router/match.ts - HTTP endpoints
.get('/:playerToken/stats', async ({ params: { playerToken } }) => {
    const stats = await getPlayerStats(playerToken);
    return { stats };
})

.post('/:playerToken/results', async ({ params: { playerToken }, body }) => {
    await saveGameResults(playerToken, body);
    await playt.reportScore({ 
        playerToken, 
        score: body.score 
    });
    return { success: true };
})
```


## 🔧 Development Workflow

### Code Quality Tools

```bash
# Format code
bun run format

# Lint code
bun run lint

# Fix linting issues
bun run check
```

## 🚀 Deployment

### Production Logging Setup

Before deploying to production, configure logging and error tracking services:

#### 1. Axiom Setup (Application Logging)

Axiom provides centralized logging for your production application.

**Step 1: Access Axiom**
1. Log into [Axiom.co](https://axiom.co) using GitHub dev account
2. Select or switch to the appropriate organization/workspace

**Step 2: Create Dataset**
1. Click "Datasets" in the sidebar
2. Click "Create Dataset"
3. Name it (e.g., `game-template-prod` or `your-game-name-prod`)
4. Click "Create"

**Step 3: Get API Token**
1. Go to "Settings" → "API Tokens"
2. Click "Create Token"
3. Select "Ingest" permission
4. Copy the token (you won't see it again!)

**Step 4: Configure in Code**
Update the dataset name in `src/server/server.ts`:
```typescript
transport: process.env.AXIOM_TOKEN
    ? {
        target: '@axiomhq/pino',
        options: {
            dataset: 'your-game-name-prod', // Change this to your dataset name
            token: process.env.AXIOM_TOKEN,
        },
    }
    : { target: 'pino-pretty' },
```

**Step 5: Set Environment Variable**
Add to your production environment (Coolify, Railway, etc.):
```bash
AXIOM_TOKEN=your_axiom_token_here
```

#### 2. Sentry Setup (Error Tracking)

Sentry captures and tracks errors in both frontend and backend.

**Step 1: Access Sentry**
1. Log into [Sentry.io](https://sentry.io) using your existing account
2. Select or switch to the appropriate organization

**Step 2: Create Project**
1. Click "Projects" → "Create Project"
2. Select platform: **Node.js** (use default project settings)
3. Name your project (e.g., `game-template` or `your-game-name`)
4. Click "Create Project"

**Step 3: Get DSN (Data Source Name)**
1. After creating the project, you'll see the DSN in the setup page
2. Or find it later in: Settings → Projects → [Your Project] → Client Keys (DSN)
3. Copy the DSN - you'll need to set this in the prod dev console

**Step 4: Set Environment Variables in dev Console**

#### Complete Production Environment Variables

```bash
# Playt Platform
VITE_CLASH_PARADISE_API_HOST_URL=https://clashparadise.io
API_KEY=your_production_game_api_key

# Logging & Monitoring
AXIOM_TOKEN=your_axiom_ingest_token

# Optional: Disable CORS in production
ENABLE_CORS=false
```

### Local Deployment Test

```bash
# Build the project
bun run build

# Start production server
NODE_ENV=production bun run start
```

## 🔊 Audio System

The template includes audio support with example sounds:

```typescript
// In your Phaser scene
preload() {
    this.load.audio('bgMusic', 'music.ogg');
    this.load.audio('moveSound', 'move_1.ogg');
    this.load.audio('gameOver', 'gameover.ogg');
}

create() {
    // Check if muted (from URL parameter)
    const isMuted = api.isMuted();
    
    if (!isMuted) {
        this.sound.play('bgMusic', { loop: true });
    }
}
```

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**: Check VITE_CLASH_PARADISE_API_HOST_URL and server status
2. **Missing playerToken**: If you send a correct player token it's enough, but if you just want to test stuff, ensure URL includes `?playerToken=xxx&gameId=yyy`
3. **API Key Issues**: Verify API_KEY in environment variables
4. **Build Errors**: Run `bun install` and check Node/Bun versions

## 📚 Additional Resources

- [Phaser 3 Documentation](https://phaser.io/phaser3)
- [Elysia Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)
- [Playt Client](https://github.com/playt-net/client)

## Other games already developed in this fashion
- [2048](https://github.com/playt-net/2048)
- [Wanted Emoji](https://github.com/playt-net/wanted-emoji)


**Ready to build your game?** Start by modifying the `LoadingScene` and create your first custom game scene! 🎮