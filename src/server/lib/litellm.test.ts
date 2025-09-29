/**
 * @vitest-environment node
 */

import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
	assignBudget,
	createBudget,
	getCustomerInfo,
	listCustomers,
} from "./litellm";

const server = setupServer(
	http.get(`${env.LITELLM_PROXY_URL}/customer/list`, () => {
		// Return an array directly, not wrapped in a data property
		return HttpResponse.json([
			{
				user_id: "123",
				email: null,
				spend: 100,
				litellm_budget_table: { max_budget: 200 },
			},
		]);
	}),
	http.get(`${env.LITELLM_PROXY_URL}/customer/info`, ({ request }) => {
		const url = new URL(request.url);
		const endUserId = url.searchParams.get("end_user_id");
		if (endUserId === "123") {
			return HttpResponse.json({
				user_id: "123",
				email: null,
				spend: 100,
				litellm_budget_table: null, // Match the implementation's expected structure
			});
		}
		return new HttpResponse(null, { status: 404 });
	}),
	http.post(`${env.LITELLM_PROXY_URL}/budget/new`, () => {
		return HttpResponse.json({
			budget_id: "budget-1",
			max_budget: 100,
		});
	}),
	http.post(`${env.LITELLM_PROXY_URL}/customer/new`, () => {
		return HttpResponse.json({
			budget_id: "budget-1",
			max_budget: 100,
		});
	}),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LiteLLM API Wrapper", () => {
	describe("listCustomers", () => {
		it("should return a list of customers on success", async () => {
			const customers = await listCustomers();
			expect(customers).toEqual([
				{ user_id: "123", email: null, spend: 100, max_budget: 200 },
			]);
		});

		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.get(`${env.LITELLM_PROXY_URL}/customer/list`, () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);
			await expect(listCustomers()).rejects.toThrow(TRPCError);
		});
	});

	describe("getCustomerInfo", () => {
		it("should return customer info on success", async () => {
			const info = await getCustomerInfo("123");
			expect(info).toEqual({
				user_id: "123",
				email: null,
				spend: 100,
				max_budget: null,
				budgets: [],
			});
		});

		it("should throw a TRPCError on failure", async () => {
			await expect(getCustomerInfo("404")).rejects.toThrow(TRPCError);
		});
	});

	describe("createBudget", () => {
		it("should return a success message on creation", async () => {
			const mockInput = {
				budget_id: "test-budget",
				max_budget: 100,
			};
			const response = await createBudget(mockInput);
			expect(response).toEqual({
				budget_id: "budget-1",
				max_budget: 100,
			});
		});

		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.post(`${env.LITELLM_PROXY_URL}/budget/new`, () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);
			await expect(
				createBudget({
					budget_id: "budget-1",
					max_budget: 100,
				}),
			).rejects.toThrow(TRPCError);
		});
	});

	describe("assignBudget", () => {
		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.post(`${env.LITELLM_PROXY_URL}/customer/new`, () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);
			await expect(assignBudget("123", "budget-1")).rejects.toThrow(TRPCError);
		});
	});
});
