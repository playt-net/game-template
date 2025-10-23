// Mock client for local development without playt
import type { MatchSchema } from '../shared/matchSchema';
import type z from 'zod';

type Match = z.infer<typeof MatchSchema>;

// Mock WebSocket-like object
class MockWebSocket {
	private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

	send(data: unknown) {
		console.log('[MockWebSocket] Sending:', data);
		// Simulate server responses
		if (
			typeof data === 'object' &&
			data !== null &&
			'type' in data &&
			data.type === 'validateMove'
		) {
			console.log(
				'[MockWebSocket] Move validated:',
				'direction' in data ? data.direction : 'unknown',
			);
		} else if (
			typeof data === 'object' &&
			data !== null &&
			'type' in data &&
			data.type === 'scoreUpdate'
		) {
			console.log(
				'[MockWebSocket] Score updated:',
				'score' in data ? data.score : 'unknown',
			);
		}
	}

	subscribe() {
		return this;
	}

	on(event: string, callback: (data: unknown) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)?.add(callback);
		return this;
	}

	off(event: string, callback: (data: unknown) => void) {
		this.listeners.get(event)?.delete(callback);
		return this;
	}

	close() {
		console.log('[MockWebSocket] Closed');
		this.listeners.clear();
	}
}

// Mock match data
const mockMatch: Match = {
	id: `mock-match-${Date.now()}`,
	status: 'running',
	matchTier: {
		playerCount: 2,
		type: 'match',
	},
	difficulty: 1,
	players: [
		{
			userId: 'mock-player-1',
			name: 'You',
			avatar: {
				url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock1',
				backgroundColor: '#94BFFF',
			},
			scoreSnapshots: [],
		},
		{
			userId: 'mock-player-2',
			name: 'Opponent',
			avatar: {
				url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock2',
				backgroundColor: '#FFAA7A',
			},
			scoreSnapshots: [
				{
					score: 0,
					timestamp: new Date().toISOString(),
				},
			],
		},
	],
	player: {
		userId: 'mock-player-1',
		name: 'You',
		avatar: {
			url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock1',
			backgroundColor: '#94BFFF',
		},
		scoreSnapshots: [],
	},
};

// Mock opponent score that increases over time
let mockOpponentScore = 0;
const opponentScoreInterval = setInterval(() => {
	// Simulate opponent making progress
	mockOpponentScore += Math.floor(Math.random() * 50);
}, 5000);

// Mock client implementation
const mockClient = {
	// Mock PlaytBrowserClient methods
	initialize: async (config: { gameVersion: string }) => {
		console.log('[MockClient] Initialized with version:', config.gameVersion);
		return Promise.resolve();
	},

	// WebSocket mock
	ws: new MockWebSocket(),

	// Check if muted
	isMuted: () => {
		const params = new URLSearchParams(window.location.search);
		return params.get('mute') === 'true';
	},

	// Get match data
	getMatch: async () => {
		console.log('[MockClient] Getting match data');
		// Update opponent score snapshot
		const opponentPlayer = mockMatch.players.find(
			(p) => p.userId === 'mock-player-2',
		);
		if (opponentPlayer) {
			opponentPlayer.scoreSnapshots = [
				{
					score: mockOpponentScore,
					timestamp: new Date().toISOString(),
				},
			];
		}
		return Promise.resolve(mockMatch);
	},

	// Submit score
	submitScore: async (score: number) => {
		console.log('[MockClient] Submitting score:', score);
		// Update player score snapshot
		const player = mockMatch.players.find((p) => p.userId === 'mock-player-1');
		if (player) {
			player.scoreSnapshots.push({
				score,
				timestamp: new Date().toISOString(),
			});
		}
		return Promise.resolve({ success: true });
	},

	// Submit final score
	submitFinalScore: async (score: number) => {
		console.log('[MockClient] Submitting final score:', score);
		// Update player with final score
		const player = mockMatch.players.find((p) => p.userId === 'mock-player-1');
		if (player) {
			player.finalScore = score;
			player.scoreSnapshots.push({
				score,
				timestamp: new Date().toISOString(),
			});
		}
		if (mockMatch.player) {
			mockMatch.player.finalScore = score;
		}
		return Promise.resolve({ success: true });
	},

	// End match
	endMatch: async () => {
		console.log('[MockClient] Ending match');
		clearInterval(opponentScoreInterval);
		return Promise.resolve({ success: true });
	},

	// Additional playt methods (add as needed)
	getPlayerToken: () => 'mock-player-token',
	getGameId: () => 'mock-game-id',
	quitMatch: async () => {
		console.log('[MockClient] Quitting match');
		clearInterval(opponentScoreInterval);
		return Promise.resolve({ success: true });
	},
};

// Export playt separately for compatibility
export const playt = {
	quitMatch: mockClient.quitMatch,
	initialize: mockClient.initialize,
};

export default mockClient;
