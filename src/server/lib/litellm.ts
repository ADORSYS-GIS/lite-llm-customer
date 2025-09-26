import { env } from "@/env.js";
import { TRPCError } from "@trpc/server";
import axios, { isAxiosError } from "axios";
/**
 * This file contains a wrapper around the LiteLLM API for managing customers and budgets.
 * It uses axios for making HTTP requests and zod for validating inputs and outputs.
 */
import { z } from "zod";

const litellmClient = axios.create({
	baseURL: env.LITELLM_PROXY_URL,
	headers: {
		Authorization: `Bearer ${env.LITELLM_API_KEY}`,
	},
});

// Zod Schemas for API validation
const CustomerSchema = z.object({
	user_id: z.string(),
	spend: z.number(),
	max_budget: z.nullable(z.number()),
});

const CustomerListSchema = z.array(CustomerSchema);

const CustomerInfoSchema = CustomerSchema.extend({
	budgets: z.array(
		z.object({
			budget_id: z.string(),
			max_budget: z.nullable(z.number()),
			spend: z.number(),
		}),
	),
});

const BudgetPayloadSchema = z.object({
	budget_id: z.string(),
	max_budget: z.number(),
	currency: z.string(),
	reset_interval: z.string(),
});

const BudgetResponseSchema = z.object({
	budget_id: z.string(),
	max_budget: z.number(),
});

/**
 * Lists all customers.
 * @returns A promise that resolves to a list of customers.
 * @throws Throws an error if the API call fails or the response is invalid.
 */
export async function listCustomers() {
	try {
		const response = await litellmClient.get("/customer/list");
		const transformedData = response.data.map(
			(customer: {
				user_id: string;
				spend: number;
				litellm_budget_table: { max_budget: number | null };
			}) => ({
				user_id: customer.user_id,
				spend: customer.spend,
				max_budget: customer.litellm_budget_table?.max_budget ?? null,
			}),
		);
		return CustomerListSchema.parse(transformedData);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ?? "Failed to list customers.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to list customers.",
			cause: error,
		});
	}
}

/**
 * Gets information for a specific customer.
 * @param endUserId The ID of the end user.
 * @returns A promise that resolves to the customer's information.
 * @throws Throws a TRPCError if the API call fails or the response is invalid.
 */
export async function getCustomerInfo(endUserId: string) {
	try {
		const response = await litellmClient.get("/customer/info", {
			params: { end_user_id: endUserId },
		});
		const info = response.data;
		const transformedInfo = {
			...info,
			max_budget: info.litellm_budget_table?.max_budget ?? null,
			budgets: info.litellm_budget_table
				? [
						{
							budget_id: info.litellm_budget_table.budget_id,
							max_budget: info.litellm_budget_table.max_budget,
							spend: info.spend,
						},
					]
				: [],
		};
		return CustomerInfoSchema.parse(transformedInfo);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ??
					"Failed to get customer info.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to get customer info.",
			cause: error,
		});
	}
}

/**
 * Creates a new budget.
 * @param userId The ID of the user.
 * @param budgetId The ID of the budget.
 * @returns A promise that resolves to the response from the API.
 * @throws Throws a TRPCError if the API call fails or the response is invalid.
 */
export async function createBudget(
	budget: z.infer<typeof BudgetPayloadSchema>,
) {
	try {
		const payload = BudgetPayloadSchema.parse(budget);
		const response = await litellmClient.post("/budget/new", payload);
		return BudgetResponseSchema.parse(response.data);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ?? "Failed to create budget.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to create budget.",
			cause: error,
		});
	}
}

/**
 * Assigns a budget to a user.
 * @param userId The ID of the user.
 * @param budgetId The ID of the budget.
 * @returns A promise that resolves to the response from the API.
 * @throws Throws a TRPCError if the API call fails or the response is invalid.
 */
export async function assignBudget(userId: string, budgetId: string) {
	try {
		const payload = BudgetPayloadSchema.parse({
			user_id: userId,
			budget_id: budgetId,
		});
		const response = await litellmClient.post("/customer/new", payload);
		return BudgetResponseSchema.parse(response.data);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ?? "Failed to assign budget.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to assign budget.",
			cause: error,
		});
	}
}
