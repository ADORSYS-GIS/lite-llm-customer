import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";

export default function AdminDashboard() {
	const { data: session } = useSession();
	const { data: customers } = api.budget.listCustomers.useQuery();

	// Calculate stats
	const totalCustomers = customers?.length || 0;
	const totalSpend = customers?.reduce((sum, customer) => sum + customer.spend, 0) || 0;
	const totalBudget = customers?.reduce((sum, customer) => sum + (customer.max_budget || 0), 0) || 0;
	const activeCustomers = customers?.filter(customer => customer.spend > 0).length || 0;

	return (
		<div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-bold text-slate-900 dark:text-white">LiteClient</h1>
							<nav className="hidden md:flex items-center space-x-6">
								<Link href="/" className="text-sm font-medium text-primary">Dashboard</Link>
								<Link href="/admin/customers" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Customers</Link>
								<Link href="/admin/budgets" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Budgets</Link>
							</nav>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-slate-600 dark:text-slate-400">Welcome, {session?.user?.email}</span>
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

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h2>
					<p className="text-slate-600 dark:text-slate-400">Monitor your LiteLLM proxy usage and customer activity</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCustomers}</p>
							</div>
							<div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Customers</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCustomers}</p>
							</div>
							<div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Spend</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">${totalSpend.toFixed(2)}</p>
							</div>
							<div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budget</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">${totalBudget.toFixed(2)}</p>
							</div>
							<div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
								<svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Quick Actions Card */}
					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
						<div className="space-y-3">
							<Link href="/admin/customers" className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
								<div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
									<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<div>
									<p className="font-medium text-slate-900 dark:text-white">Manage Customers</p>
									<p className="text-sm text-slate-600 dark:text-slate-400">View and manage customer accounts</p>
								</div>
							</Link>
							
							<Link href="/admin/customers/new" className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full text-left">
								<div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
									<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</div>
								<div>
									<p className="font-medium text-slate-900 dark:text-white">Add New Customer</p>
									<p className="text-sm text-slate-600 dark:text-slate-400">Create a new customer account</p>
								</div>
							</Link>

							<Link href="/admin/budgets/new" className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full text-left">
								<div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
									<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
								<div>
									<p className="font-medium text-slate-900 dark:text-white">Create Budget</p>
									<p className="text-sm text-slate-600 dark:text-slate-400">Set up new budget limits</p>
								</div>
							</Link>
						</div>
					</div>

					{/* System Status Card */}
					<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
									<span className="text-slate-900 dark:text-white">LiteLLM Proxy</span>
								</div>
								<span className="text-sm text-green-500 font-medium">Online</span>
							</div>
							
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
									<span className="text-slate-900 dark:text-white">Ollama Service</span>
								</div>
								<span className="text-sm text-green-500 font-medium">Online</span>
							</div>
							
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
									<span className="text-slate-900 dark:text-white">Database</span>
								</div>
								<span className="text-sm text-green-500 font-medium">Connected</span>
							</div>

							<div className="pt-4 border-t border-slate-200 dark:border-slate-700">
								<p className="text-sm text-slate-600 dark:text-slate-400">Last updated: {new Date().toLocaleTimeString()}</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}