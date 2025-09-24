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
	http.get("http://localhost:4000/customer/list", () => {
		return HttpResponse.json({
			data: [{ user_id: "123", spend: 100, max_budget: 200 }],
		});
	}),
	http.get("http://localhost:4000/customer/info", ({ request }) => {
		const url = new URL(request.url);
		const endUserId = url.searchParams.get("end_user_id");
		if (endUserId === "123") {
			return HttpResponse.json({
				user_id: "123",
				spend: 100,
				max_budget: 200,
				budgets: [],
			});
		}
		return new HttpResponse(null, { status: 404 });
	}),
	http.post("http://localhost:4000/budget/new", () => {
		return HttpResponse.json({ message: "Budget created" });
	}),
	http.post("http://localhost:4000/budget/assign", () => {
		return HttpResponse.json({ message: "Budget assigned" });
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
				{ user_id: "123", spend: 100, max_budget: 200 },
			]);
		});

		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.get("http://localhost:4000/customer/list", () => {
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
				spend: 100,
				max_budget: 200,
				budgets: [],
			});
		});

		it("should throw a TRPCError on failure", async () => {
			await expect(getCustomerInfo("404")).rejects.toThrow(TRPCError);
		});
	});

	describe("createBudget", () => {
		it("should return a success message on creation", async () => {
			const response = await createBudget("123", "budget-1");
			expect(response).toEqual({ message: "Budget created" });
		});

		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.post("http://localhost:4000/budget/new", () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);
			await expect(createBudget("123", "budget-1")).rejects.toThrow(TRPCError);
		});
	});

	describe("assignBudget", () => {
		it("should return a success message on assignment", async () => {
			const response = await assignBudget("123", "budget-1");
			expect(response).toEqual({ message: "Budget assigned" });
		});

		it("should throw a TRPCError on failure", async () => {
			server.use(
				http.post("http://localhost:4000/budget/assign", () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);
			await expect(assignBudget("123", "budget-1")).rejects.toThrow(TRPCError);
		});
	});
});
