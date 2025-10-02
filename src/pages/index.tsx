import { api } from "@/utils/api";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const { data: session } = useSession();
	const { data: customers } = api.budget.listCustomersDetailed.useQuery();
	const { data: healthStatus } = api.system.health.useQuery();

	// Calculate stats
	const totalCustomers = customers?.length || 0;
	const totalSpend =
		customers?.reduce((sum, customer) => sum + customer.spend, 0) || 0;
	const totalBudget =
		customers?.reduce((sum, customer) => sum + (customer.max_budget || 0), 0) ||
		0;
	const activeCustomers =
		customers?.filter((customer) => customer.spend > 0).length || 0;

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
								<Link href="/" className="font-medium text-primary text-sm">
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
									className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
      							<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      							</svg>
      						</button>
							<span className="text-slate-600 text-sm dark:text-slate-400">
								Welcome, {session?.user?.email}
							</span>
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
				{/* Mobile menu */}
				<div id="mobile-menu" className={`${mobileOpen ? "block" : "hidden"} md:hidden px-4 pb-3`}>
					<div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
						<Link href="/" className="block rounded px-3 py-2 text-sm font-medium text-primary">
							Dashboard
						</Link>
						<Link href="/admin/customers" className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
							Customers
						</Link>
						<Link href="/admin/budgets" className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
							Budgets
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">
						Dashboard Overview
					</h2>
					<p className="text-slate-600 dark:text-slate-400">
						Monitor your LiteLLM proxy usage and customer activity
					</p>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Link href="/admin/customers" aria-label="View customers list" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-slate-600 text-sm dark:text-slate-400">Total Customers</p>
								<p className="font-bold text-2xl text-slate-900 dark:text-white">{totalCustomers}</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
								<svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img">
									<title>Customers Icon</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
								</svg>
							</div>
						</div>
					</Link>

					<Link href="/admin/customers" aria-label="View active customers" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-slate-600 text-sm dark:text-slate-400">Active Customers</p>
								<p className="font-bold text-2xl text-slate-900 dark:text-white">{activeCustomers}</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
								<svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img">
									<title>Revenue Icon</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
						</div>
					</Link>

					<Link href="/admin/customers" aria-label="View spending details" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-slate-600 text-sm dark:text-slate-400">Total Spend</p>
								<p className="font-bold text-2xl text-slate-900 dark:text-white">${totalSpend.toFixed(2)}</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
								<svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img">
									<title>Conversion Icon</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
								</svg>
							</div>
						</div>
					</Link>

					<Link href="/admin/budgets" aria-label="View budgets list" className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-slate-600 text-sm dark:text-slate-400">Total Budget</p>
								<p className="font-bold text-2xl text-slate-900 dark:text-white">${totalBudget.toFixed(2)}</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
								<svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img">
									<title>Activity Icon</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
						</div>
					</Link>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Quick Actions Card */}
					<div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
						<h3 className="mb-4 font-semibold text-lg text-slate-900 dark:text-white">
							Quick Actions
						</h3>
						<div className="space-y-3">
							<Link
								href="/admin/customers"
								className="flex items-center rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
							>
								<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
									<svg
										className="h-5 w-5 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
									>
										<title>Customers Icon</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
										/>
									</svg>
								</div>
								<div>
									<p className="font-medium text-slate-900 dark:text-white">
										Manage Customers
									</p>
									<p className="text-slate-600 text-sm dark:text-slate-400">
										View and manage customer accounts
									</p>
								</div>
							</Link>
						</div>
					</div>

					{/* System Status Card */}
					<div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
						<h3 className="mb-4 font-semibold text-lg text-slate-900 dark:text-white">
							System Status
						</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div
										className={`mr-3 h-3 w-3 rounded-full ${
											healthStatus?.status === "Online"
												? "bg-green-500"
												: "bg-red-500"
										}`}
									/>
									<span className="text-slate-900 dark:text-white">
										LiteLLM Proxy
									</span>
								</div>
								<span
									className={`font-medium text-sm ${
										healthStatus?.status === "Online"
											? "text-green-500"
											: "text-red-500"
									}`}
								>
									{healthStatus?.status ?? "Loading..."}
								</span>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
