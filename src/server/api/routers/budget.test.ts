/**
 * @vitest-environment node
 */
import type { inferRouterInputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCallerFactory } from "@/server/api/trpc";
import {
	assignBudget,
	createBudget,
	getCustomerInfo,
	listCustomers,
} from "@/server/lib/litellm";

import { budgetRouter } from "./budget";

vi.mock("@/server/lib/litellm", () => ({
	assignBudget: vi.fn(),
	createBudget: vi.fn(),
	getCustomerInfo: vi.fn(),
	listCustomers: vi.fn(),
}));

const createCaller = createCallerFactory(budgetRouter);
type RouterInputs = inferRouterInputs<typeof budgetRouter>;

const adminSession: Session = {
	expires: new Date().toISOString(),
	user: {
		id: "test-admin-id",
		email: "admin@example.com",
		name: "Admin",
	},
};

const createAdminCaller = () =>
	createCaller({
		session: adminSession,
	});

describe("budgetRouter", () => {
	const mockedListCustomers = vi.mocked(listCustomers);
	const mockedGetCustomerInfo = vi.mocked(getCustomerInfo);
	const mockedCreateBudget = vi.mocked(createBudget);
	const mockedAssignBudget = vi.mocked(assignBudget);

	beforeEach(() => {
		mockedListCustomers.mockReset();
		mockedGetCustomerInfo.mockReset();
		mockedCreateBudget.mockReset();
		mockedAssignBudget.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("listCustomers", () => {
		it("returns customers", async () => {
			mockedListCustomers.mockResolvedValueOnce([
				{ user_id: "123", email: null, spend: 10, max_budget: null },
			]);

			const caller = createAdminCaller();
			const customers = await caller.listCustomers();
			expect(customers).toEqual([
				{ user_id: "123", spend: 10, max_budget: null },
			]);
		});

		it("throws when wrapper data invalid", async () => {
			mockedListCustomers.mockResolvedValueOnce([
				{ user_id: 123, email: null, spend: 10, max_budget: null } as unknown as {
					user_id: string;
					email: string | null;
					spend: number;
					max_budget: number | null;
				},
			]);

			const caller = createAdminCaller();
			await expect(caller.listCustomers()).rejects.toBeInstanceOf(TRPCError);
		});
	});

	describe("getCustomerInfo", () => {
		it("returns customer info", async () => {
			mockedGetCustomerInfo.mockResolvedValueOnce({
				user_id: "user-1",
				email: null,
				spend: 0,
				max_budget: null,
				budgets: [],
			});

			const caller = createAdminCaller();
			const result = await caller.getCustomerInfo({ end_user_id: "user-1" });
			expect(result).toEqual({
				user_id: "user-1",
				spend: 0,
				max_budget: null,
				budgets: [],
			});
			expect(mockedGetCustomerInfo).toHaveBeenCalledWith("user-1");
		});

		it("passes through zod validation errors", async () => {
			const caller = createAdminCaller();
			await expect(
				caller.getCustomerInfo({
					end_user_id: "",
				} as RouterInputs["getCustomerInfo"]),
			).rejects.toBeInstanceOf(TRPCError);
		});
	});

	describe("createBudget", () => {
		it("creates budget", async () => {
			const mockInput = {
				budget_id: "test-budget",
				max_budget: 100,
			};
			mockedCreateBudget.mockResolvedValueOnce({
				budget_id: "budget-1",
				max_budget: 100,
			});
			const caller = createAdminCaller();
			const result = await caller.createBudget(mockInput);
			expect(result).toEqual({
				budget_id: "budget-1",
				max_budget: 100,
			});
			expect(mockedCreateBudget).toHaveBeenCalledWith(mockInput);
		});

		it("validates input", async () => {
			mockedCreateBudget.mockRejectedValue(
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create budget.",
				}),
			);
			const caller = createAdminCaller();
			await expect(
				caller.createBudget({
					budget_id: "budget-1",
					max_budget: 100,
				}),
			).rejects.toBeInstanceOf(TRPCError);
		});
	});

	describe("assignBudget", () => {
		it("assigns budget", async () => {
			mockedAssignBudget.mockResolvedValueOnce({
				budget_id: "budget-1",
				max_budget: 100,
			});
			const caller = createAdminCaller();
			const result = await caller.assignBudget({
				user_id: "user-1",
				budget_id: "budget-1",
			});
			expect(result).toEqual({
				budget_id: "budget-1",
				max_budget: 100,
			});
			expect(mockedAssignBudget).toHaveBeenCalledWith("user-1", "budget-1");
		});

		it("validates input", async () => {
			const caller = createAdminCaller();
			await expect(
				caller.assignBudget({ user_id: "user-1", budget_id: "" }),
			).rejects.toBeInstanceOf(TRPCError);
		});
	});
});
