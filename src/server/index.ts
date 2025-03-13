import { Elysia } from "elysia";
import matchRouter from "./router/match";
import gameRouter from "./router/game";

const app = new Elysia().use(matchRouter).use(gameRouter).listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
