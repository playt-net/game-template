import { Elysia, t } from "elysia";
import playt from "../utils/playt";

const matchRouter = new Elysia({
	name: "match",
	prefix: "/api/match",
}).get(
	"/:playerToken",
	async ({ error, params: { playerToken } }) => {
		const {
			data: match,
			ok,
			status,
			statusText,
		} = await playt.searchMatch({ playerToken });
		if (!ok) {
			return error(status, statusText);
		}
		return match;
	},
	{
		params: t.Object({
			playerToken: t.String(),
		}),
	},
);

export default matchRouter;
