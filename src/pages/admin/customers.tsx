import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import Link from "next/link";

const CustomersPage: NextPage = () => {
	const {
		data: customers,
		isLoading,
		error,
	} = api.budget.listCustomers.useQuery();

	if (isLoading) {
		return (
			<Layout>
				<Spinner />
			</Layout>
		);
	}

	if (error) {
		return <Layout>Error: {error.message}</Layout>;
	}

	return (
		<div className="relative flex h-auto min-h-screen w-full">
			<aside className="flex w-64 flex-col border-black/10 border-r bg-white dark:border-white/10 dark:bg-background-dark">
				<div className="flex h-16 items-center gap-4 px-6">
					<div className="h-8 w-8 text-primary">
						<svg
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>LiteLLM Logo</title>
							<path d="M12 2L2 7l10 5 10-5-10-5z" />
							<path d="M2 17l10 5 10-5" />
							<path d="M2 12l10 5 10-5" />
						</svg>
					</div>
					<h2 className="font-bold text-black text-lg dark:text-white">
						LiteClient
					</h2>
				</div>
				<nav className="flex-1 space-y-2 p-4">
					<Link
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> dashboard </span>
						<span>Dashboard</span>
					</Link>
					<Link
						className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-2 font-medium text-primary text-sm"
						href="/admin/customers"
					>
						<span className="material-symbols-outlined"> group </span>
						<span>Customers</span>
					</Link>
					<Link
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/admin/budgets/new"
					>
						<span className="material-symbols-outlined">
							{" "}
							account_balance_wallet{" "}
						</span>
						<span>Budgets</span>
					</Link>
					<Link
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> assessment </span>
						<span>Reports</span>
					</Link>
					<Link
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> settings </span>
						<span>Settings</span>
					</Link>
				</nav>
				<div className="border-black/10 border-t p-4 dark:border-white/10">
					<div className="flex items-center gap-3">
						<div className="aspect-square w-10 overflow-hidden rounded-full">
							<img
								alt="User avatar"
								className="h-full w-full object-cover"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqYwxDkHyvT8aBoP1K_HwH6lUsgKsMl9LFd9PEhDTKA5EQJQvvzLOmzwIbNABnhrYRpiMHz_GG6aZxDXHaAMg5u7uuK0MaAGjT9KH6pgSDytXQxc4OQ-ZzG0xtexkZoGpNsE7_6Al_ZiDQp5I0MgWk2UzYQUuBeYZQ9ohJ6-cHwIHJG9N7W7Vx0zQ1i0GJCMQWKvN0VT7q_ZzOyevgSc3aS4o9r5XdbVWxHia2J_rQW3aX5aUiFAY3TVOJbuRJDG70UG_B13VbvKU"
							/>
						</div>
						<div>
							<p className="font-medium text-black text-sm dark:text-white">
								Admin User
							</p>
							<p className="text-black/60 text-xs dark:text-white/60">
								admin@liteclient.com
							</p>
						</div>
					</div>
				</div>
			</aside>
			<main className="flex-1 bg-background-light p-8 dark:bg-background-dark/80">
				<div className="mx-auto max-w-7xl">
					<div className="mb-8">
						<h1 className="font-bold text-3xl text-black tracking-tight dark:text-white">
							Customers
						</h1>
						<p className="mt-2 text-black/60 text-sm dark:text-white/60">
							Manage your customer base and their budgets.
						</p>
					</div>
					<div className="space-y-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="relative flex-1">
								<span className="material-symbols-outlined -translate-y-1/2 pointer-events-none absolute top-1/2 left-3 text-black/40 dark:text-white/40">
									{" "}
									search{" "}
								</span>
								<input
									className="w-full rounded-lg border-black/10 bg-white py-2 pr-4 pl-10 text-black text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-background-dark dark:text-white dark:focus:border-primary"
									placeholder="Search customers"
									type="search"
								/>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 font-medium text-black text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-background-dark dark:text-white dark:hover:bg-white/5"
								>
									<span>Status</span>
									<span className="material-symbols-outlined text-sm">
										{" "}
										expand_more{" "}
									</span>
								</button>
								<button
									type="button"
									className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 font-medium text-black text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-background-dark dark:text-white dark:hover:bg-white/5"
								>
									<span>Budget Range</span>
									<span className="material-symbols-outlined text-sm">
										{" "}
										expand_more{" "}
									</span>
								</button>
							</div>
						</div>
						<div className="overflow-x-auto rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-background-dark">
							<table className="min-w-full table-auto">
								<thead className="border-black/10 border-b dark:border-white/10">
									<tr>
										<th className="px-6 py-3 text-left font-medium text-black/60 text-xs uppercase tracking-wider dark:text-white/60">
											Name
										</th>
										<th className="px-6 py-3 text-left font-medium text-black/60 text-xs uppercase tracking-wider dark:text-white/60">
											Email
										</th>
										<th className="px-6 py-3 text-left font-medium text-black/60 text-xs uppercase tracking-wider dark:text-white/60">
											Current Budget
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-black/10 dark:divide-white/10">
									{customers?.map((customer) => (
										<tr
											key={customer.user_id}
											className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
										>
											<td className="whitespace-nowrap px-6 py-4 font-medium text-black text-sm dark:text-white">
												<Link href={`/admin/customers/${customer.user_id}`}>
													{customer.user_id}
												</Link>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-black/60 text-sm dark:text-white/60">
												{customer.user_id}@email.com
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-black/60 text-sm dark:text-white/60">
												${customer.max_budget}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CustomersPage;
