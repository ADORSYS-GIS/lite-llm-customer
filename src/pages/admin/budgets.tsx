import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const BudgetsPage: NextPage = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	// Pagination state for budgets table
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const {
		data: budgets,
		isLoading: budgetsLoading,
		error: budgetsError,
		refetch,
	} = api.budget.listBudgets.useQuery();

	const {
		data: customers,
		isLoading: customersLoading,
		error: customersError,
	} = api.budget.listCustomersDetailed.useQuery();

	const isLoading = budgetsLoading || customersLoading;
	const error = budgetsError || customersError;

	// Define types for the customer data structure (moved outside component previously can cause hooks mismatch if conditionally declared).
	type BudgetTable = {
		budget_id: string;
		max_budget: number | null;
		spend: number;
		created_at?: string;
	};

	type Customer = {
		user_id: string;
		email: string | null;
		spend: number;
		max_budget: number | null;
		created_at: string | null;
		blocked: boolean;
		litellm_budget_table: BudgetTable | null;
	};

	// Provide fallback for undefined budgets and customers
	const budgetList = budgets || [];
	const customerList = (customers || []) as Customer[];

	// Pagination derived values
	const total = budgetList.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paginatedBudgets = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return budgetList.slice(start, start + pageSize);
	}, [budgetList, currentPage, pageSize]);

	// Reset to first page if budgets change
	useEffect(() => {
		setPage(1);
	}, []);

	// Function to count customers assigned to a specific budget
	const getCustomerCountForBudget = (budgetId: string) => {
		return customerList.filter(
			(customer) => customer.litellm_budget_table?.budget_id === budgetId,
		).length;
	};

	// Calculate total assigned customers across all budgets
	const totalAssignedCustomers = customerList.filter(
		(customer) => customer.litellm_budget_table !== null,
	).length;

	// After all hooks are declared, handle loading/error states
	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center">
				Error loading budgets: {error.message}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background-light font-display dark:bg-background-dark">
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

			<main className="flex-grow">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<h2 className="font-bold text-3xl text-slate-900 dark:text-white">
								Budgets
							</h2>
							<p className="mt-1 text-slate-600 dark:text-slate-400">
								Manage budget limits and spending controls
							</p>
						</div>
						<Link
							href="/admin/budgets/new"
							className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 md:mt-0 md:w-auto"
						>
							<span className="material-symbols-outlined text-base">
								Create
							</span>
							Budget
						</Link>
					</div>

					{/* Budget Stats */}
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-slate-600 text-sm dark:text-slate-400">
										Total Budgets
									</p>
									<p className="font-bold text-2xl text-slate-900 dark:text-white">
										{budgetList.length}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
									<svg
										className="h-6 w-6 text-blue-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
									>
										<title>Total Budgets Icon</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-slate-600 text-sm dark:text-slate-400">
										Total Allocated
									</p>
									<p className="font-bold text-2xl text-slate-900 dark:text-white">
										$
										{budgetList
											.reduce((sum, budget) => sum + budget.max_budget, 0)
											.toFixed(2)}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
									<svg
										className="h-6 w-6 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
									>
										<title>Total Allocated Icon</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-slate-600 text-sm dark:text-slate-400">
										Assigned Customers
									</p>
									<p className="font-bold text-2xl text-slate-900 dark:text-white">
										{totalAssignedCustomers}
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
									<svg
										className="h-6 w-6 text-purple-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
									>
										<title>Total Spent Icon</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Budgets Table */}
					<div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
						<div className="border-slate-200 border-b px-6 py-4 dark:border-slate-700">
							<h3 className="font-semibold text-lg text-slate-900 dark:text-white">
								Budget Overview
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="bg-slate-50 text-slate-600 text-xs uppercase dark:bg-slate-800 dark:text-slate-400">
									<tr>
										<th className="px-6 py-3" scope="col">
											Budget ID
										</th>
										<th className="px-6 py-3" scope="col">
											Max Budget
										</th>
										<th className="px-6 py-3" scope="col">
											Currency
										</th>
										<th className="px-6 py-3" scope="col">
											Reset Interval
										</th>
										<th className="px-6 py-3" scope="col">
											Customers
										</th>
										<th className="px-6 py-3" scope="col">
											Created
										</th>
									</tr>
								</thead>
								<tbody>
									{paginatedBudgets.map((budget) => (
										<tr
											key={budget.budget_id}
											className="border-slate-200 border-b transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
										>
											<td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
												<Link
													href={`/admin/budgets/${encodeURIComponent(budget.budget_id)}`}
													className="text-primary hover:underline"
												>
													{budget.budget_id}
												</Link>
											</td>
											<td className="px-6 py-4 text-slate-900 dark:text-white">
												${budget.max_budget.toFixed(2)}
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												USD
											</td>
											<td className="px-6 py-4">
												<span className="rounded-full bg-blue-500/20 px-2 py-1 font-medium text-blue-400 text-xs capitalize">
													{budget.budget_duration || "No limit"}
												</span>
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												{getCustomerCountForBudget(budget.budget_id)}
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												{budget.created_at
													? new Date(budget.created_at).toLocaleDateString()
													: "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{/* Pagination controls */}
						<div className="mt-4 flex flex-col items-center justify-between gap-4 px-6 pb-4 md:flex-row">
							<div className="flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400">
								<span>Rows per page:</span>
								<select
									className="rounded border border-slate-300 bg-transparent p-1 dark:border-slate-700"
									value={pageSize}
									onChange={(e) => {
										setPageSize(Number(e.target.value));
										setPage(1);
									}}
								>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
								</select>
								<span>
									{Math.min((currentPage - 1) * pageSize + 1, total) || 0} -
									{Math.min(currentPage * pageSize, total)} of {total}
								</span>
							</div>
							<div className="flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400">
								<button
									type="button"
									onClick={() => setPage(1)}
									disabled={currentPage === 1}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									First
								</button>
								<button
									type="button"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									Prev
								</button>
								<span className="text-sm">
									Page {currentPage} of {totalPages}
								</span>
								<button
									type="button"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={currentPage === totalPages}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									Next
								</button>
								<button
									type="button"
									onClick={() => setPage(totalPages)}
									disabled={currentPage === totalPages}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									Last
								</button>
							</div>
						</div>
					</div>

					{/* Empty State (if no budgets) */}
					{budgetList.length === 0 && (
						<div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
								<svg
									className="h-8 w-8 text-slate-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
								>
									<title>No Budgets Icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 font-semibold text-lg text-slate-900 dark:text-white">
								No budgets found
							</h3>
							<p className="mb-6 text-slate-600 dark:text-slate-400">
								Get started by creating your first budget to manage customer
								spending limits.
							</p>
							<Link
								href="/admin/budgets/new"
								className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
								>
									<title>Add Budget Icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Create Your First Budget
							</Link>
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default BudgetsPage;
