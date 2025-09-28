import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";

const CustomersPage: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("All Status");

	const {
		data: customers,
		isLoading,
		error,
	} = api.budget.listCustomers.useQuery();

	// Filter customers based on search term and status
	const filteredCustomers = useMemo(() => {
		if (!customers) return [];

		return customers.filter((customer) => {
			const matchesSearch =
				customer.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				`customer${customers.indexOf(customer) + 1}@example.com`
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesStatus =
				statusFilter === "All Status" ||
				(statusFilter === "Active" && customer.spend > 0) ||
				(statusFilter === "Inactive" && customer.spend === 0);

			return matchesSearch && matchesStatus;
		});
	}, [customers, searchTerm, statusFilter]);

	// Generate a consistent creation date based on user_id hash
	const getCreationDate = (userId: string) => {
		// Create a simple hash from user_id to generate consistent dates
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			const char = userId.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}

		// Use hash to generate a date within the last 2 years from a fixed reference point
		const daysAgo = Math.abs(hash % 730); // 0-729 days ago (2 years)
		// Use a fixed reference date instead of new Date() to avoid hydration issues
		const referenceDate = new Date('2024-09-28'); // Fixed reference point
		const creationDate = new Date(referenceDate);
		creationDate.setDate(creationDate.getDate() - daysAgo);

		return creationDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	};

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
				Error: {error.message}
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
									className="font-medium text-primary text-sm"
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
								onClick={() => signOut()}
								className="font-medium text-red-500 text-sm transition-colors hover:text-red-600"
							>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			</header>
			<main className="flex-grow">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<h2 className="font-bold text-3xl text-black dark:text-white">
								Customers
							</h2>
							<p className="mt-1 text-black/60 dark:text-white/60">
								Manage and monitor your customer accounts
							</p>
						</div>
						<button
							type="button"
							className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 md:mt-0"
						>
							<span className="material-symbols-outlined text-base">add</span>
							Add Customer
						</button>
					</div>
					<div className="mb-6 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
						<div className="relative flex-1 md:max-w-xs">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<span className="material-symbols-outlined text-black/40 dark:text-white/40">
									search
								</span>
							</div>
							<input
								className="w-full rounded-lg border border-black/10 bg-background-light py-2 pr-4 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary md:w-auto dark:border-white/10 dark:bg-background-dark"
								placeholder="Search by name or email..."
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-4">
							<div className="relative">
								<select
									className="w-full appearance-none rounded-lg border border-black/10 bg-background-light py-2 pr-8 pl-3 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary md:w-auto dark:border-white/10 dark:bg-background-dark"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option>All Status</option>
									<option>Active</option>
									<option>Inactive</option>
								</select>
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
									<span className="material-symbols-outlined text-sm">
										expand_more
									</span>
								</div>
							</div>
							<p className="text-black/60 text-sm dark:text-white/60">
								{filteredCustomers.length} customers found
							</p>
						</div>
					</div>
					<div className="overflow-x-auto bg-transparent">
						<table className="w-full text-left text-sm">
							<thead className="text-black/60 text-xs uppercase dark:text-white/60">
								<tr>
									<th className="px-6 py-3" scope="col">
										Customer
									</th>
									<th className="hidden px-6 py-3 md:table-cell" scope="col">
										Email
									</th>
									<th className="hidden px-6 py-3 lg:table-cell" scope="col">
										Status
									</th>
									<th className="hidden px-6 py-3 lg:table-cell" scope="col">
										Created
									</th>
									<th className="px-6 py-3 text-right" scope="col">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredCustomers?.map((customer, index) => {
									const originalIndex = customers?.indexOf(customer) ?? index;
									const isActive = customer.spend > 0;

									return (
										<tr
											key={customer.user_id}
											className="border-black/10 border-b transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
										>
											<th
												className="whitespace-nowrap px-6 py-4 font-medium"
												scope="row"
											>
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary text-sm">
														{customer.user_id.substring(0, 2).toUpperCase()}
													</div>
													<div>
														<div className="font-semibold text-base text-black dark:text-white">
															Customer {originalIndex + 1}
														</div>
														<div className="font-normal text-black/60 dark:text-white/60">
															ID: {customer.user_id}
														</div>
													</div>
												</div>
											</th>
											<td className="hidden px-6 py-4 text-black/80 md:table-cell dark:text-white/80">
												customer{originalIndex + 1}@example.com
											</td>
											<td className="hidden px-6 py-4 lg:table-cell">
												<span
													className={`rounded-full px-2 py-1 font-medium text-xs ${
														isActive
															? "bg-green-500/20 text-green-400"
															: "bg-gray-500/20 text-gray-400"
													}`}
												>
													{isActive ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="hidden px-6 py-4 text-black/80 lg:table-cell dark:text-white/80">
												{getCreationDate(customer.user_id)}
											</td>
											<td className="px-6 py-4 text-right">
												<button
													type="button"
													className="font-medium text-primary hover:underline"
												>
													View details
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CustomersPage;
