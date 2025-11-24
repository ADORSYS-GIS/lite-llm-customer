import { generateKey, regenerateKey } from "@/server/lib/litellm";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

const generateKeyInputSchema = z.object({
	key_alias: z.string().optional(),
	models: z.array(z.string()).optional(),
	max_budget: z.number().optional(),
});

const regenerateKeyInputSchema = z.object({
	key: z.string().min(1, "key is required"),
});

export const keyRouter = createTRPCRouter({
	generateKey: adminProcedure
		.input(generateKeyInputSchema)
		.mutation(async ({ input, ctx }) => {
			const user_id = ctx.session.user.id;
			return generateKey({ ...input, user_id });
		}),
	regenerateKey: adminProcedure
		.input(z.object({}))
		.mutation(async ({ ctx }) => {
			const userId = ctx.session.user.id;
			return regenerateKey(userId);
		}),
});
