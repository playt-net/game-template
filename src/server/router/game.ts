import { Elysia, t } from "elysia";

const gameRouter = new Elysia({
	name: "game",
	prefix: "/api/game",
})
	.guard({
		params: t.Object({
			playerToken: t.String(),
		}),
	})
	.ws("/:playerToken", {
		message: async (ws, message) => {
			const { type, playerToken } = message;
			switch (type) {
				case "example":
					ws.send({
						type: "example",
						response: `Hello, ${playerToken}!`,
					});
					break;
			}
		},
		body: t.Union([
			t.Object({
				type: t.Literal("example"),
				playerToken: t.String(),
			}),
		]),
		response: t.Union([
			t.Object({
				type: t.Literal("example"),
				response: t.String(),
			}),
		]),
	});

export default gameRouter;
