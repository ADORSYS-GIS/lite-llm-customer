import {
	assignBudget,
	createBudget,
	getCustomerInfo,
	listCustomers,
} from "@/server/lib/litellm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

const listCustomersOutputSchema = z.array(
	z.object({
		user_id: z.string(),
		spend: z.number(),
		max_budget: z.number().nullable(),
	}),
);

const customerInfoSchema = z.object({
	user_id: z.string(),
	spend: z.number(),
	max_budget: z.number().nullable(),
	budgets: z.array(
		z.object({
			budget_id: z.string(),
			max_budget: z.number().nullable(),
			spend: z.number(),
		}),
	),
});

const createBudgetInputSchema = z.object({
	budget_id: z.string().min(1, "budget_id is required"),
	max_budget: z.number(),
	currency: z.string(),
	reset_interval: z.string(),
});

const assignBudgetInputSchema = z.object({
	user_id: z.string().min(1, "user_id is required"),
	budget_id: z.string().min(1, "budget_id is required"),
});

export const budgetRouter = createTRPCRouter({
	listCustomers: adminProcedure.query(async () => {
		const customers = await listCustomers();
		try {
			return listCustomersOutputSchema.parse(customers);
		} catch (cause) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Received unexpected data while listing customers.",
				cause,
			});
		}
	}),
	getCustomerInfo: adminProcedure
		.input(
			z.object({
				end_user_id: z.string().min(1, "end_user_id is required"),
			}),
		)
		.query(async ({ input }) => {
			const info = await getCustomerInfo(input.end_user_id);
			try {
				return customerInfoSchema.parse(info);
			} catch (cause) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Received unexpected data while fetching customer info.",
					cause,
				});
			}
		}),
	createBudget: adminProcedure
		.input(createBudgetInputSchema)
		.mutation(async ({ input }) => {
			return createBudget(input);
		}),
	assignBudget: adminProcedure
		.input(assignBudgetInputSchema)
		.mutation(async ({ input }) => {
			return assignBudget(input.user_id, input.budget_id);
		}),
});
