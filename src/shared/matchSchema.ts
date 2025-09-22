import z from 'zod';

// Zod schema for match data structure
const AvatarSchema = z.object({
	url: z.string(),
	backgroundColor: z.enum([
		'#FFAA7A',
		'#A9FF94',
		'#D694FF',
		'#94BFFF',
		'#7EFFD1',
		'#FFDB7E',
		'#FF7E7E',
	]),
});

const ScoreSnapshotSchema = z.object({
	score: z.number(),
	timestamp: z.string().or(z.date()),
});

const PlayerSchema = z.object({
	userId: z.string(),
	avatar: AvatarSchema,
	name: z.string(),
	scoreSnapshots: z.array(ScoreSnapshotSchema),
	finalScore: z.number().optional(),
	replayId: z.string().optional(),
});

const MatchTierSchema = z.object({
	playerCount: z.number(),
	type: z.enum(['match', 'tutorial']),
});

export const MatchSchema = z.object({
	id: z.string(),
	player: PlayerSchema.optional(),
	players: z.array(PlayerSchema),
	status: z.enum(['running', 'finished', 'cancelled']),
	matchTier: MatchTierSchema,
	difficulty: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});
