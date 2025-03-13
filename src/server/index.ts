import { Elysia } from "elysia";
import matchRouter from "./router/match";
import gameRouter from "./router/game";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@bogeychan/elysia-logger";

const isDev = process.env.NODE_ENV === "development";

const app = new Elysia()
	.use(
		logger({
			transport: process.env.AXIOM_TOKEN
				? {
						target: "@axiomhq/pino",
						options: {
							dataset: "wanted-emoji-prod",
							token: process.env.AXIOM_TOKEN,
						},
					}
				: { target: "pino-pretty" },
		}),
	)
	.onError(({ log, error, code }) => {
		log?.error({ error, code }, "Error");
		return new Response(error.toString());
	})
	.use(matchRouter)
	.use(gameRouter);

if (!isDev) {
	app.use(
		staticPlugin({
			assets: "dist",
			prefix: "/",
			ignorePatterns: ["/images/"],
		}),
	);
}

app.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
