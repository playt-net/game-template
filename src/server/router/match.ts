import { Elysia, t } from 'elysia';
import playt from '../utils/playt';
import { MatchSchema } from 'src/shared/matchSchema';

interface PlayerState {
	score: number;
	moves: number;
	bestTile?: number;
	mergeCount?: number;
	gameOver?: boolean;
	won?: boolean;
}

const setInitialPlayerState = async (
	_playerToken: string,
	updatePlayer: (player: PlayerState) => void,
): Promise<PlayerState> => {
	const initialState: PlayerState = {
		score: 0,
		moves: 0,
		bestTile: 2,
		mergeCount: 0,
		gameOver: false,
		won: false,
	};
	updatePlayer(initialState);
	return initialState;
};

const matchRouter = new Elysia({
	name: 'match',
	prefix: '/api/match',
})
	.decorate('playerStates', new Map<string, PlayerState>())
	.get(
		'/:playerToken',
		async ({ params: { playerToken } }) => {
			try {
				const {
					data: match,
					ok,
					status,
					statusText,
				} = await playt.searchMatch({ playerToken });
				if (!ok) {
					return new Response(statusText, { status });
				}

				try {
					const parsedMatch = MatchSchema.parse(match);
					return parsedMatch;
				} catch (parseError) {
					console.warn('Match data validation failed:', parseError);
					return match;
				}
			} catch (err) {
				console.warn('Playt API error, using fallback:', err);
				return {
					id: `fallback-match-${playerToken}`,
					status: 'running',
					player: {
						userId: playerToken,
						finalScore: null,
					},
					seed: Date.now(),
				};
			}
		},
		{
			params: t.Object({
				playerToken: t.String(),
			}),
		},
	)
	.post(
		'/submit-score/:playerToken',
		async ({ body, params: { playerToken }, playerStates }) => {
			try {
				let player = playerStates.get(playerToken);
				if (!player) {
					player = await setInitialPlayerState(playerToken, (newPlayer) => {
						playerStates.set(playerToken, newPlayer);
					});
				}

				const updatedPlayer: PlayerState = {
					...player,
					score: body.score,
				};

				playerStates.set(playerToken, updatedPlayer);

				const submitData = {
					playerToken,
					score: body.score,
					...(body.finalSnapshot !== undefined && {
						finalSnapshot: body.finalSnapshot,
					}),
					...(body.surrender !== undefined && { surrender: body.surrender }),
				};

				const result = body.timestamp
					? await playt.submitScore({
							...submitData,
							timestamp: body.timestamp,
						})
					: await playt.submitScore(submitData);

				const { data, ok, status, statusText } = result;

				if (!ok) {
					return new Response(statusText, { status });
				}

				return {
					success: true,
					data,
				};
			} catch (err) {
				return new Response('Failed to submit score', { status: 500 });
			}
		},
		{
			body: t.Object({
				score: t.Number(),
				finalSnapshot: t.Optional(t.Boolean()),
				surrender: t.Optional(t.Boolean()),
				timestamp: t.Optional(t.String()),
			}),
		},
	)
	.guard({
		params: t.Object({
			playerToken: t.String(),
		}),
	})
	.derive(async ({ params, playerStates }) => {
		const playerToken = params.playerToken;
		const updatePlayer = (player: PlayerState) => {
			playerStates.set(playerToken, player);
		};

		let player = playerStates.get(playerToken);
		if (!player) {
			player = await setInitialPlayerState(playerToken, updatePlayer);
			console.info(`New player state created for ${playerToken}`);
		}
		return { player, updatePlayer };
	})
	.post(
		'/end/:playerToken',
		async ({ params: { playerToken }, playerStates }) => {
			const player = playerStates.get(playerToken);

			if (!player) {
				throw new Response('Player not found', { status: 404 });
			}

			console.info(`Final score submission for player ${playerToken}`, {
				playerToken,
				score: player.score,
				moves: player.moves,
			});

			const finalPlayer = playerStates.get(playerToken);
			if (!finalPlayer) {
				throw new Response('Player state lost during final submission', {
					status: 404,
				});
			}

			const submitData = {
				playerToken,
				score: finalPlayer.score,
				finalSnapshot: true,
			};

			await playt.submitScore({
				...submitData,
				timestamp: new Date().toISOString(),
			});

			console.info('Final score submitted', {
				playerToken,
				score: finalPlayer.score,
				moves: finalPlayer.moves,
				bestTile: finalPlayer.bestTile,
				mergeCount: finalPlayer.mergeCount,
				gameOver: finalPlayer.gameOver,
				won: finalPlayer.won,
			});

			playerStates.delete(playerToken);

			console.info(`Player state deleted for ${playerToken}`);

			return {
				success: true,
				finalScore: finalPlayer.score,
				moves: finalPlayer.moves,
				bestTile: finalPlayer.bestTile,
				mergeCount: finalPlayer.mergeCount,
			};
		},
	);

export default matchRouter;
