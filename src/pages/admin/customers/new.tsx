import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const NewCustomerPage: NextPage = () => {
	const router = useRouter();
	const [userId, setUserId] = useState("");
	const [budgetId, setBudgetId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const assignBudgetMutation = api.budget.assignBudget.useMutation({
		onSuccess: () => {
			// Clear the form before redirecting
			setUserId("");
			setBudgetId("");
			router.push("/admin/customers");
		},
		onError: (error) => {
			console.error("Failed to create customer:", error);
			setIsSubmitting(false);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId.trim() || !budgetId.trim()) return;

		setIsSubmitting(true);
		assignBudgetMutation.mutate({
			user_id: userId.trim(),
			budget_id: budgetId.trim(),
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

			{/* Main Content */}
			<main className="flex-grow">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h2 className="mb-2 font-bold text-3xl text-white">
							Add New Customer
						</h2>
						<p className="text-white/60">
							Create a new customer by assigning them to a budget
						</p>
					</div>

					{/* Form */}
					<div className="max-w-md">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label
									htmlFor="userId"
									className="mb-2 block font-medium text-sm text-white"
								>
									Customer Email (ID)
								</label>
								<input
									id="userId"
									type="email"
									value={userId}
									onChange={(e) => setUserId(e.target.value)}
									className="w-full rounded-lg border border-white/10 bg-background-dark px-3 py-2 text-white transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="e.g., customer@example.com"
									required
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label
									htmlFor="budgetId"
									className="mb-2 block font-medium text-sm text-white"
								>
									Budget ID
								</label>
								<input
									id="budgetId"
									type="text"
									value={budgetId}
									onChange={(e) => setBudgetId(e.target.value)}
									className="w-full rounded-lg border border-white/10 bg-background-dark px-3 py-2 text-white transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="e.g., free-tier"
									required
									disabled={isSubmitting}
								/>
							</div>

							{assignBudgetMutation.error && (
								<div className="mb-4 space-y-2">
									<div className="flex items-start rounded-lg bg-red-500/10 p-3">
										<svg
											className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
											role="img"
											aria-label="Error"
										>
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
												clipRule="evenodd"
											/>
										</svg>
										<p className="ml-2 text-red-500 text-sm">
											{assignBudgetMutation.error.data?.code === "NOT_FOUND"
												? `Budget ID "${budgetId}" not found.`
												: assignBudgetMutation.error.message}
										</p>
									</div>
									{assignBudgetMutation.error.data?.code === "NOT_FOUND" && (
										<div className="flex items-center justify-between rounded-b-lg bg-red-900/10 px-3 py-2">
											<p className="text-red-400 text-xs">
												Would you like to create this budget?
											</p>
											<Link
												href={`/admin/budgets/new?budgetId=${encodeURIComponent(budgetId)}`}
												className="font-medium text-red-500 text-xs hover:text-red-400 hover:underline"
											>
												Create Budget →
											</Link>
										</div>
									)}
								</div>
							)}

							<div className="flex gap-4">
								<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
									<button
										type="submit"
										disabled={
											isSubmitting || !userId.trim() || !budgetId.trim()
										}
										className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
									>
										{isSubmitting && <Spinner />}
										{isSubmitting ? "Creating..." : "Create Customer"}
									</button>

									<Link
										href="/admin/customers"
										className="w-full rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-white/5 sm:w-auto"
									>
										Cancel
									</Link>
								</div>
							</div>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
};

export default NewCustomerPage;
