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
	email: z.string().nullable(),
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

const BudgetSchema = z.object({
	budget_id: z.string(),
	max_budget: z.number(),
	soft_budget: z.number().nullable(),
	max_parallel_requests: z.number().nullable(),
	tpm_limit: z.number().nullable(),
	rpm_limit: z.number().nullable(),
	model_max_budget: z.any().nullable(),
	budget_duration: z.string().nullable(),
	budget_reset_at: z.string().nullable(),
	created_at: z.string(),
	created_by: z.string(),
	updated_at: z.string(),
	updated_by: z.string(),
	organization: z.any().nullable(),
	keys: z.any().nullable(),
	end_users: z.any().nullable(),
	team_membership: z.any().nullable(),
	organization_membership: z.any().nullable(),
});

const BudgetListSchema = z.array(BudgetSchema);

const BudgetPayloadSchema = z.object({
	budget_id: z.string(),
	max_budget: z.number(),
});

const AssignBudgetPayloadSchema = z.object({
	user_id: z.string(),
	budget_id: z.string(),
});

const BudgetResponseSchema = z.object({
	budget_id: z.string(),
	max_budget: z.number(),
});

/**
 * Lists all customers with basic info.
 * @returns A promise that resolves to a list of customers.
 * @throws Throws an error if the API call fails or the response is invalid.
 */
export async function listCustomers() {
	try {
		const response = await litellmClient.get("/customer/list");
		const transformedData = response.data.map(
			(customer: {
				user_id: string;
				email?: string | null;
				spend: number;
				blocked: boolean;
				litellm_budget_table: { max_budget: number | null } | null;
			}) => ({
				user_id: customer.user_id,
				email: customer.email ?? null,
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
 * Lists all customers with detailed info including emails and creation dates.
 * This fetches individual customer info for each customer to get complete data.
 * @returns A promise that resolves to a list of customers with full details.
 * @throws Throws an error if the API call fails or the response is invalid.
 */
export async function listCustomersDetailed() {
	try {
		// First get the basic customer list and budget list
		const [listResponse, budgetResponse] = await Promise.all([
			litellmClient.get("/customer/list"),
			litellmClient.get("/budget/list"),
		]);

		// Create a map of budget_id to budget creation date
		const budgetCreationDates: Record<string, string> = {};
		for (const budget of budgetResponse.data) {
			if (budget.budget_id && budget.created_at) {
				budgetCreationDates[budget.budget_id] = budget.created_at;
			}
		}

		// Then fetch detailed info for each customer
		const detailedCustomers = await Promise.all(
			listResponse.data.map(async (customer: { user_id: string }) => {
				try {
					const infoResponse = await litellmClient.get("/customer/info", {
						params: { end_user_id: customer.user_id },
					});
					const info = infoResponse.data;

					// Enhance budget table with creation date if available
					let enhancedBudgetTable = info.litellm_budget_table;
					if (
						enhancedBudgetTable?.budget_id &&
						budgetCreationDates[enhancedBudgetTable.budget_id]
					) {
						enhancedBudgetTable = {
							...enhancedBudgetTable,
							created_at: budgetCreationDates[enhancedBudgetTable.budget_id],
						};
					}

					return {
						user_id: info.user_id,
						email: info.email ?? null,
						spend: info.spend ?? 0,
						max_budget: info.litellm_budget_table?.max_budget ?? null,
						created_at: info.created_at ?? null,
						blocked: info.blocked ?? false,
						litellm_budget_table: enhancedBudgetTable,
					};
				} catch (error) {
					// If individual customer info fails, return basic info
					console.warn(
						`Failed to get detailed info for customer ${customer.user_id}:`,
						error,
					);
					return {
						user_id: customer.user_id,
						email: null,
						spend: 0,
						max_budget: null,
						created_at: null,
						blocked: false,
						litellm_budget_table: null,
					};
				}
			}),
		);

		return detailedCustomers;
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ??
					"Failed to list customers with details.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to list customers with details.",
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
			email: info.email ?? null, // Ensure email field is present
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
					`Failed to get customer info for ${endUserId}. Status: ${error.response?.status}`,
				cause: error,
			});
		}
		// Check if it's a Zod validation error
		if (error instanceof Error && error.message.includes("ZodError")) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `Data validation failed for customer ${endUserId}: ${error.message}`,
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Failed to get customer info for ${endUserId}: ${error instanceof Error ? error.message : "Unknown error"}`,
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
		// First, check if the budget exists
		const budgets = await listBudgets();
		const budgetExists = budgets.some(
			(budget) => budget.budget_id === budgetId,
		);

		if (!budgetExists) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `Budget with ID "${budgetId}" does not exist. Please create the budget first.`,
			});
		}

		// If budget exists, proceed with assignment
		const payload = AssignBudgetPayloadSchema.parse({
			user_id: userId,
			budget_id: budgetId,
		});

		const response = await litellmClient.post("/customer/update", payload);
		return response.data;
	} catch (error) {
		// If it's already a TRPCError (like our NOT_FOUND), just rethrow it
		if (error instanceof TRPCError) {
			throw error;
		}

		// Handle axios errors
		if (isAxiosError(error)) {
			// Handle foreign key constraint error specifically
			if (
				error.response?.status === 500 &&
				error.response?.data?.error?.message?.includes(
					"Foreign key constraint failed",
				)
			) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Budget with ID "${budgetId}" does not exist. Please create the budget first.`,
				});
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ?? "Failed to assign budget.",
				cause: error,
			});
		}

		// Handle any other errors
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message:
				error instanceof Error ? error.message : "Failed to assign budget.",
			cause: error,
		});
	}
}

/**
 * Lists all budgets.
 * @returns A promise that resolves to a list of budgets.
 * @throws Throws a TRPCError if the API call fails or the response is invalid.
 */
export async function listBudgets() {
	try {
		const response = await litellmClient.get("/budget/list");
		return BudgetListSchema.parse(response.data);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ??
					`Failed to list budgets. Status: ${error.response?.status}`,
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Failed to list budgets: ${error instanceof Error ? error.message : "Unknown error"}`,
			cause: error,
		});
	}
}

/**
 * Updates an existing budget's max_budget.
 */
export async function updateBudget(budget_id: string, max_budget: number) {
	try {
		const payload = BudgetPayloadSchema.parse({ budget_id, max_budget });
		const response = await litellmClient.post("/budget/update", payload);
		return BudgetResponseSchema.parse(response.data);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message:
					error.response?.data?.error?.message ?? "Failed to update budget.",
				cause: error,
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to update budget.",
			cause: error,
		});
	}
}
