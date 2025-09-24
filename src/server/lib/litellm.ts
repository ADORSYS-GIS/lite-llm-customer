/**
 * This file contains a wrapper around the LiteLLM API for managing customers and budgets.
 * It uses axios for making HTTP requests and zod for validating inputs and outputs.
 */
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { env } from "@/env.js";
import { TRPCError } from "@trpc/server";

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

const CustomerListSchema = z.object({
  data: z.array(CustomerSchema),
});

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
  user_id: z.string(),
  budget_id: z.string(),
});

const BudgetResponseSchema = z.object({
  // Assuming a simple success message or similar.
  // Adjust if the actual response is different.
  message: z.string(),
});

/**
 * Lists all customers.
 * @returns A promise that resolves to a list of customers.
 * @throws Throws an error if the API call fails or the response is invalid.
 */
export async function listCustomers() {
  try {
    const response = await litellmClient.get("/customer/list");
    return CustomerListSchema.parse(response.data).data;
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
    return CustomerInfoSchema.parse(response.data);
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
export async function createBudget(userId: string, budgetId: string) {
  try {
    const payload = BudgetPayloadSchema.parse({
      user_id: userId,
      budget_id: budgetId,
    });
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
    const response = await litellmClient.post("/budget/assign", payload);
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