import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

const BudgetDetailPage: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;

	const {
		data: budgets,
		isLoading,
		error,
		refetch,
	} = api.budget.listBudgets.useQuery();
	const updateMutation = api.budget.updateBudget.useMutation({
		onSuccess: () => {
			void refetch();
			setMessage({ type: "success", text: "Budget updated successfully" });
		},
		onError: (err) => {
			setMessage({
				type: "error",
				text: err.message || "Failed to update budget",
			});
		},
	});

	const [newMaxBudget, setNewMaxBudget] = useState<string>("");
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const budget = useMemo(() => {
		if (!budgets || !id || typeof id !== "string") return null;
		return budgets.find((b) => b.budget_id === id) ?? null;
	}, [budgets, id]);

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

	if (!budget) {
		return (
			<div className="min-h-screen bg-background-light p-8 font-display dark:bg-background-dark">
				Budget not found
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background-light font-display dark:bg-background-dark">
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

			<main className="container mx-auto px-2 py-6 sm:px-4 sm:py-8">
				<div className="mx-auto max-w-3xl px-2 sm:px-4 lg:px-8">
					<div className="mb-8">
						<h1 className="font-bold text-3xl text-slate-900 tracking-tight dark:text-white">
							Budget: {budget.budget_id}
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							Created{" "}
							{budget.created_at
								? new Date(budget.created_at).toLocaleString()
								: "—"}
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-background-dark">
							<h3 className="font-medium text-lg text-slate-900 dark:text-white">
								Current Max Budget
							</h3>
							<p className="mt-2 font-bold text-3xl text-slate-900 dark:text-white">
								${budget.max_budget.toFixed(2)}
							</p>
						</div>
						<div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-background-dark">
							<h3 className="font-medium text-lg text-slate-900 dark:text-white">
								Edit Max Budget
							</h3>
							<div className="mt-4 flex flex-col gap-3 sm:flex-row">
								<input
									type="number"
									step="0.01"
									placeholder="New amount"
									value={newMaxBudget}
									onChange={(e) => setNewMaxBudget(e.target.value)}
									className="flex-1 rounded border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
								/>
								<button
									type="button"
									onClick={() => {
										const amount = Number(newMaxBudget);
										if (!Number.isFinite(amount) || amount < 0) {
											setMessage({
												type: "error",
												text: "Please enter a valid non-negative number",
											});
											return;
										}
										updateMutation.mutate({
											budget_id: budget.budget_id,
											max_budget: amount,
										});
									}}
									disabled={updateMutation.isLoading}
									className="rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
								>
									{updateMutation.isLoading ? "Saving..." : "Save"}
								</button>
							</div>
							{message && (
								<p
									className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
								>
									{message.text}
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default BudgetDetailPage;
