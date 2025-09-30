import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const CustomerDetailPage: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const { data: session } = useSession();
	const {
		data: customer,
		isLoading,
		error,
	} = api.budget.getCustomerInfo.useQuery(
		{ end_user_id: id as string },
		{ enabled: !!id },
	);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background-light font-display dark:bg-background-dark">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background-light p-8 font-display dark:bg-background-dark">
				Error: {error.message}
			</div>
		);
	}

	if (!customer) {
		return <div>Customer not found</div>;
	}

	return (
		<div className="min-h-screen bg-background-light font-display dark:bg-background-dark">
			{/* Header */}
			<header className="sticky top-0 z-10 border-slate-200 border-b bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-8">
							<Link
								href="/"
								className="font-bold text-slate-900 text-xl dark:text-white"
							>
								LiteClient
							</Link>
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
						<div className="flex items-center">
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

			{/* Main Content */}
			<main className="container mx-auto px-2 py-6 sm:px-4 sm:py-8">
				<div className="mx-auto max-w-4xl px-2 sm:px-4 lg:px-8">
					<div className="mb-8">
						<h1 className="font-bold text-3xl text-white tracking-tight">
							{customer.user_id}
						</h1>
					</div>
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-background-dark">
								<h3 className="font-medium text-lg text-white">Spend</h3>
								<p className="mt-2 font-bold text-3xl text-white">
									${customer.spend.toFixed(2)}
								</p>
							</div>
							<div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-background-dark">
								<h3 className="font-medium text-lg text-white">Max Budget</h3>
								<p className="mt-2 font-bold text-3xl text-white">
									$
									{customer.max_budget ? customer.max_budget.toFixed(2) : "N/A"}
								</p>
							</div>
						</div>
						<div>
							<h3 className="font-medium text-lg text-white">Budgets</h3>
							<div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-background-dark">
								<table className="min-w-full table-auto">
									<thead className="border-black/10 border-b dark:border-white/10">
										<tr>
											<th className="px-6 py-3 text-left font-medium text-white/60 text-xs uppercase tracking-wider">
												Budget ID
											</th>
											<th className="px-6 py-3 text-left font-medium text-white/60 text-xs uppercase tracking-wider">
												Spend
											</th>
											<th className="px-6 py-3 text-left font-medium text-white/60 text-xs uppercase tracking-wider">
												Max Budget
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-black/10 dark:divide-white/10">
										{customer.budgets.map((budget) => (
											<tr key={budget.budget_id}>
												<td className="whitespace-nowrap px-6 py-4 font-medium text-sm text-white">
													{budget.budget_id}
												</td>
												<td className="whitespace-nowrap px-6 py-4 text-sm text-white/60">
													${budget.spend.toFixed(2)}
												</td>
												<td className="whitespace-nowrap px-6 py-4 text-sm text-white/60">
													$
													{budget.max_budget
														? budget.max_budget.toFixed(2)
														: "N/A"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CustomerDetailPage;
