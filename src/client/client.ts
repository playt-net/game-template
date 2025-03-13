import { treaty } from "@elysiajs/eden";
import type { App } from "../server/index";
import PlaytBrowserClient from "@playt/client/browser";

const host = window.location.host;
const apiUrl = import.meta.env.VITE_API_HOST;

const params = new URLSearchParams(window.location.search);

const playerToken = params.get("playerToken");
if (!playerToken) {
	throw new Error("Missing playerToken query param");
}

const gameId = params.get("gameId");
if (!gameId) {
	throw new Error("Missing gameId query param");
}

export const playt = PlaytBrowserClient({
	gameId,
	apiUrl,
	playerToken,
});

const gameVersion = import.meta.env.npm_package_version;
if (!gameVersion) {
	throw new Error("Missing game version");
}

void playt.initialize({ gameVersion });

const client = treaty<App>(host);

const gameWS = client.api.game({ playerToken }).subscribe();

export default {
	...playt,
	ws: gameWS,
	getMatch: async () => {
		const response = await client.api.match({ playerToken }).get();
		return response.data;
	},
	isMuted: () => {
		return params.get("mute") === "true";
	},
	exampleWS: async () => {
		gameWS.send({
			type: "example",
			playerToken,
		});
	},
};
