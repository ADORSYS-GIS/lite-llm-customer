import { env } from "@/env";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const systemRouter = createTRPCRouter({
	health: adminProcedure.query(async () => {
		try {
			const response = await fetch(`${env.LITELLM_PROXY_URL}/health`, {
				headers: {
					Authorization: `Bearer ${env.LITELLM_API_KEY}`,
				},
			});
			if (response.ok) {
				return { status: "Online" };
			}
			return { status: "Offline" };
		} catch (error) {
			return { status: "Offline" };
		}
	}),
});
