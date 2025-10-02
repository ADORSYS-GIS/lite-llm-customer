import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import {
	getFormattedCreationDate,
	setCustomerTimestamp,
} from "@/utils/customerTimestamps";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const CustomersPage: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("All Status");
	// Pagination state
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const {
		data: customers,
		isLoading,
		error,
	} = api.budget.listCustomersDetailed.useQuery();

	// Filter customers based on search term and status
	const filteredCustomers = useMemo(() => {
		if (!customers) return [];

		return customers.filter((customer) => {
			const haystack =
				`${customer.user_id} ${customer.email ?? ""}`.toLowerCase();
			const matchesSearch = haystack.includes(searchTerm.toLowerCase());

			const matchesStatus =
				statusFilter === "All Status" ||
				(statusFilter === "Active" && customer.spend > 0) ||
				(statusFilter === "Inactive" && customer.spend === 0);

			return matchesSearch && matchesStatus;
		});
	}, [customers, searchTerm, statusFilter]);

	// Reset to first page when filters/search change
	useEffect(() => {
		setPage(1);
	}, [searchTerm, statusFilter]);

	// Paginate filtered customers
	const total = filteredCustomers.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paginatedCustomers = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredCustomers.slice(start, start + pageSize);
	}, [filteredCustomers, currentPage, pageSize]);

	// Track new customers in local storage
	useEffect(() => {
		if (!customers) return;

		// For each customer, if they don't have a timestamp yet, set one
		for (const customer of customers) {
			setCustomerTimestamp(customer.user_id);
		}
	}, [customers]);

	// Get creation date for display
	const getCreationDate = (customer: { user_id: string }) => {
		return getFormattedCreationDate(customer.user_id);
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
									className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
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
									className="font-medium text-slate-600 text-sm transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
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
							<h2 className="font-bold text-3xl text-slate-900 dark:text-white">
								Customers
							</h2>
							<p className="mt-1 text-slate-600 dark:text-white/60">
								Manage and monitor your customer accounts
							</p>
						</div>
						<Link
							href="/admin/customers/new"
							className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 md:mt-0 md:w-auto"
						>
							<span className="material-symbols-outlined text-base" />
							Add Customer
						</Link>
					</div>
					<div className="mb-6 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
						<div className="relative flex-1 md:max-w-xs">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<span className="material-symbols-outlined text-slate-400 dark:text-white/40" />
							</div>
							<input
								className="w-full rounded-lg border-2 border-slate-300 bg-white py-2 pr-4 pl-10 text-slate-900 transition focus:border-primary focus:ring-2 focus:ring-primary md:w-auto dark:border-white/30 dark:bg-background-dark dark:text-white"
								placeholder="Search by email / customer ID..."
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-4">
							<div className="relative">
								<select
									className="w-full appearance-none rounded-lg border-2 border-slate-300 bg-white py-2 pr-8 pl-3 text-slate-900 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary md:w-auto dark:border-white/30 dark:bg-background-dark dark:text-white"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option>All Status</option>
									<option>Active</option>
									<option>Inactive</option>
								</select>
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
									<span className="material-symbols-outlined text-sm" />
								</div>
							</div>
							<p className="text-slate-600 text-sm dark:text-white/60">
								{filteredCustomers.length} customers found
							</p>
						</div>
					</div>
					<div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
						<div className="border-slate-200 border-b px-6 py-4 dark:border-slate-700">
							<h3 className="font-semibold text-lg text-slate-900 dark:text-white">
								Customer Overview
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="bg-slate-50 text-slate-600 text-xs uppercase dark:bg-slate-800 dark:text-slate-400">
									<tr>
										<th className="px-6 py-3" scope="col">
											Customer
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
									{paginatedCustomers?.map((customer, index) => {
										const originalIndex = customers?.indexOf(customer) ?? index;
										const isActive = customer.spend > 0;

										return (
											<tr
												key={customer.user_id}
												className="border-slate-200 border-b transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
											>
												<th
													className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-white"
													scope="row"
												>
													<Link
														href={`/admin/customers/${customer.user_id}`}
														className="flex items-center gap-3 transition-opacity hover:opacity-80"
													>
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary text-sm">
															{customer.user_id.substring(0, 2).toUpperCase()}
														</div>
														<div>
															<div className="font-bold text-base text-slate-900 dark:text-white">
																{customer.user_id}
															</div>
														</div>
													</Link>
												</th>
												<td className="hidden px-6 py-4 lg:table-cell">
													<span
														className={`rounded-full px-2 py-1 font-medium text-xs ${isActive ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-white"}`}
													>
														{isActive ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="hidden px-6 py-4 text-slate-600 lg:table-cell dark:text-slate-400">
													{getCreationDate(customer)}
												</td>
												<td className="px-6 py-4 text-right">
													<Link
														href={`/admin/customers/${customer.user_id}`}
														className="font-medium text-primary hover:underline"
													>
														View details
													</Link>
												</td>
											</tr>
										);
									})}
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
							<div className="flex items-center gap-2">
								<button
									onClick={() => setPage(1)}
									disabled={currentPage === 1}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									First
								</button>
								<button
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
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={currentPage === totalPages}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									Next
								</button>
								<button
									onClick={() => setPage(totalPages)}
									disabled={currentPage === totalPages}
									className="rounded border px-2 py-1 text-sm disabled:opacity-50"
								>
									Last
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CustomersPage;
