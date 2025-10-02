import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type CreateBudgetForm = {
	budget_id: string;
	max_budget: number;
	budget_duration?: string;
};

const CreateBudgetPage: NextPage = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const router = useRouter();
	const { register, handleSubmit } = useForm<CreateBudgetForm>({
		defaultValues: {
			budget_duration: "monthly",
		},
	});
	const createBudget = api.budget.createBudget.useMutation();

	const onSubmit = (data: CreateBudgetForm) => {
		createBudget.mutate(data, {
			onSuccess: () => {
				router.push("/admin/budgets");
			},
			onError: (error) => {
				console.error("Failed to create budget:", error);
			},
		});
	};

	return (
		<div className="min-h-screen bg-background-light font-display dark:bg-background-dark">
			{/* Header */}
			<header className="sticky top-0 z-10 border-slate-200 border-b bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-8">
							<h1 className="font-bold text-slate-900 text-xl dark:text-white">
								LiteClient
							</h1>
							<nav className="hidden items-center space-x-6 md:flex">
								<Link
									href="/"
									className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
								>
									Dashboard
								</Link>
								<Link
									href="/admin/customers"
									className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
								>
									Customers
								</Link>
								<Link
									href="/admin/budgets"
									className="font-medium text-primary text-sm"
								>
									Budgets
								</Link>
							</nav>
						</div>
						<div className="flex items-center space-x-4">
							<button
								type="button"
								className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
								aria-controls="mobile-menu"
								aria-expanded={mobileOpen}
								onClick={() => setMobileOpen((o) => !o)}
								title="Toggle navigation menu"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
							<button
								type="button"
								onClick={() => signOut()}
								className="font-medium text-red-500 text-sm transition-colors hover:text-red-600"
							>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			</header>
			{/* Mobile menu */}
			<div
				id="mobile-menu"
				className={`${mobileOpen ? "block" : "hidden"} px-4 pb-3 md:hidden`}
			>
				<div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
					<Link
						href="/"
						className="block rounded px-3 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Dashboard
					</Link>
					<Link
						href="/admin/customers"
						className="block rounded px-3 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Customers
					</Link>
					<Link
						href="/admin/budgets"
						className="block rounded px-3 py-2 font-medium text-primary text-sm"
					>
						Budgets
					</Link>
				</div>
			</div>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">
						Create Budget
					</h1>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 max-w-2xl space-y-5"
					>
						<div>
							<label
								htmlFor="budget_id"
								className="mb-1.5 block font-medium text-slate-900 text-sm dark:text-white"
							>
								Budget ID
							</label>
							<div className="mt-1">
								<input
									id="budget_id"
									{...register("budget_id", {
										required: "Budget ID is required",
										minLength: {
											value: 3,
											message: "Budget ID must be at least 3 characters",
										},
									})}
									placeholder="e.g., free-tier, pro-plan, team-account"
									className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-slate-900 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-background-dark dark:text-white"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="max_budget"
								className="mb-1.5 block font-medium text-slate-900 text-sm dark:text-white"
							>
								Max Budget
							</label>
							<div className="mt-1">
								<input
									id="max_budget"
									type="number"
									{...register("max_budget", {
										required: "Maximum budget is required",
										valueAsNumber: true,
										min: { value: 1, message: "Budget must be greater than 0" },
									})}
									placeholder="e.g., 100, 500, 1000"
									step="0.01"
									className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-slate-900 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-background-dark dark:text-white"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="budget_duration"
								className="mb-1.5 block font-medium text-slate-900 text-sm dark:text-white"
							>
								Reset Interval
							</label>
							<select
								id="budget_duration"
								{...register("budget_duration")}
								className="mt-1 block w-full cursor-pointer rounded-lg border-2 border-slate-300 bg-white py-2.5 pr-10 pl-4 text-slate-900 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-background-dark dark:text-white"
							>
								<option value="">Never (one-time budget)</option>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
								<option value="quarterly">Quarterly</option>
								<option value="yearly">Yearly</option>
							</select>
						</div>
						<div className="flex items-center justify-end space-x-3 pt-4">
							<div className="flex w-full gap-3 sm:w-auto">
								<Link
									href="/admin/budgets"
									className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-center font-medium text-slate-900 text-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary sm:flex-none dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
								>
									Cancel
								</Link>
								<button
									type="submit"
									className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-70 sm:flex-none"
									disabled={createBudget.isPending}
								>
									{createBudget.isPending ? "Creating..." : "Create Budget"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
};

export default CreateBudgetPage;
