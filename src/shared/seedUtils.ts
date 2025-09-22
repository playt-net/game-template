/**
 * Generates a deterministic seed from a match ID using a simple hash algorithm
 * This ensures both client and server use the same seed for the same match
 */
export function generateSeedFromMatchId(matchId: string): number {
	let hashSeed = 0;
	for (let i = 0; i < matchId.length; i++) {
		const char = matchId.charCodeAt(i);
		hashSeed = (hashSeed << 5) - hashSeed + char;
		hashSeed = hashSeed & hashSeed;
	}
	return Math.abs(hashSeed);
}
