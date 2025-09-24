import {
	assignBudget,
	createBudget,
	getCustomerInfo,
	listCustomers,
} from "@/server/lib/litellm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const litellmRouter = createTRPCRouter({
	listCustomers: protectedProcedure.query(async () => {
		return listCustomers();
	}),
	getCustomerInfo: protectedProcedure
		.input(z.object({ endUserId: z.string() }))
		.query(async ({ input }) => {
			return getCustomerInfo(input.endUserId);
		}),
	createBudget: protectedProcedure
		.input(z.object({ userId: z.string(), budgetId: z.string() }))
		.mutation(async ({ input }) => {
			return createBudget(input.userId, input.budgetId);
		}),
	assignBudget: protectedProcedure
		.input(z.object({ userId: z.string(), budgetId: z.string() }))
		.mutation(async ({ input }) => {
			return assignBudget(input.userId, input.budgetId);
		}),
});
