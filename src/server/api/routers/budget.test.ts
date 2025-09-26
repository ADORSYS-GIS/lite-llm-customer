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
	user: {
		email: "admin@example.com",
		name: "Admin",
	},
	expires: new Date().toISOString(),
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
				{ user_id: "123", spend: 10, max_budget: null },
			]);

			const caller = createAdminCaller();
			const result = await caller.listCustomers();
			expect(result).toEqual([{ user_id: "123", spend: 10, max_budget: null }]);
		});

		it("throws when wrapper data invalid", async () => {
			mockedListCustomers.mockResolvedValueOnce([
				{ user_id: 123, spend: 10, max_budget: null } as unknown as {
					user_id: string;
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
			mockedCreateBudget.mockResolvedValueOnce({ message: "ok" });
			const caller = createAdminCaller();
			const result = await caller.createBudget({
				user_id: "user-1",
				budget_id: "budget-1",
			});
			expect(result).toEqual({ message: "ok" });
			expect(mockedCreateBudget).toHaveBeenCalledWith("user-1", "budget-1");
		});

		it("validates input", async () => {
			const caller = createAdminCaller();
			await expect(
				caller.createBudget({ user_id: "", budget_id: "budget-1" }),
			).rejects.toBeInstanceOf(TRPCError);
		});
	});

	describe("assignBudget", () => {
		it("assigns budget", async () => {
			mockedAssignBudget.mockResolvedValueOnce({ message: "ok" });
			const caller = createAdminCaller();
			const result = await caller.assignBudget({
				user_id: "user-1",
				budget_id: "budget-1",
			});
			expect(result).toEqual({ message: "ok" });
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
