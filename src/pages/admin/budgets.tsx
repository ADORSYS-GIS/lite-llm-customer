import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { NextPage } from "next";

const BudgetsPage: NextPage = () => {
	const {
		data: budgets,
		isLoading: budgetsLoading,
		error: budgetsError,
		refetch
	} = api.budget.listBudgets.useQuery();

	const {
		data: customers,
		isLoading: customersLoading,
		error: customersError,
	} = api.budget.listCustomersDetailed.useQuery();

	const isLoading = budgetsLoading || customersLoading;
	const error = budgetsError || customersError;

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return <div className="flex h-screen items-center justify-center">Error loading budgets: {error.message}</div>;
	}

	// Provide fallback for undefined budgets and customers
	const budgetList = budgets || [];
	const customerList = customers || [];

	// Function to count customers assigned to a specific budget
	const getCustomerCountForBudget = (budgetId: string) => {
		return customerList.filter(customer => {
			const customerData = customer as any;
			return customerData.litellm_budget_table?.budget_id === budgetId;
		}).length;
	};

	// Calculate total assigned customers across all budgets
	const totalAssignedCustomers = customerList.filter(customer => {
		const customerData = customer as any;
		return customerData.litellm_budget_table !== null && customerData.litellm_budget_table !== undefined;
	}).length;

	return (
		<div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
			<header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-bold text-slate-900 dark:text-white">LiteClient</h1>
							<nav className="hidden md:flex items-center space-x-6">
								<Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
								<Link href="/admin/customers" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Customers</Link>
								<Link href="/admin/budgets" className="text-sm font-medium text-primary">Budgets</Link>
							</nav>
						</div>
						<div className="flex items-center space-x-4">
							<button 
								onClick={() => signOut()}
								className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
							>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			</header>
			
			<main className="flex-grow">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
						<div>
							<h2 className="text-3xl font-bold text-slate-900 dark:text-white">Budgets</h2>
							<p className="mt-1 text-slate-600 dark:text-slate-400">Manage budget limits and spending controls</p>
						</div>
						<Link href="/admin/budgets/new" className="mt-4 md:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create Budget
						</Link>
					</div>

					{/* Budget Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budgets</p>
									<p className="text-2xl font-bold text-slate-900 dark:text-white">{budgetList.length}</p>
								</div>
								<div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Allocated</p>
									<p className="text-2xl font-bold text-slate-900 dark:text-white">
										${budgetList.reduce((sum, budget) => sum + budget.max_budget, 0).toFixed(2)}
									</p>
								</div>
								<div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
									</svg>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assigned Customers</p>
									<p className="text-2xl font-bold text-slate-900 dark:text-white">
										{totalAssignedCustomers}
									</p>
								</div>
								<div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Budgets Table */}
					<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
						<div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
							<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Budget Overview</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-left">
								<thead className="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
									<tr>
										<th className="px-6 py-3" scope="col">Budget ID</th>
										<th className="px-6 py-3" scope="col">Max Budget</th>
										<th className="px-6 py-3" scope="col">Currency</th>
										<th className="px-6 py-3" scope="col">Reset Interval</th>
										<th className="px-6 py-3" scope="col">Customers</th>
										<th className="px-6 py-3" scope="col">Created</th>
										<th className="px-6 py-3 text-right" scope="col">Actions</th>
									</tr>
								</thead>
								<tbody>
									{budgetList.map((budget) => (
										<tr key={budget.budget_id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
											<td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
												{budget.budget_id}
											</td>
											<td className="px-6 py-4 text-slate-900 dark:text-white">
												${budget.max_budget.toFixed(2)}
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												USD
											</td>
											<td className="px-6 py-4">
												<span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 capitalize">
													{budget.budget_duration || 'No limit'}
												</span>
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												{getCustomerCountForBudget(budget.budget_id)}
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												{new Date(budget.created_at).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end space-x-2">
													<button className="text-primary hover:text-primary/80 font-medium text-sm">
														Edit
													</button>
													<button className="text-red-500 hover:text-red-600 font-medium text-sm">
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Empty State (if no budgets) */}
					{budgetList.length === 0 && (
						<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
							<div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No budgets found</h3>
							<p className="text-slate-600 dark:text-slate-400 mb-6">Get started by creating your first budget to manage customer spending limits.</p>
							<Link href="/admin/budgets/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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