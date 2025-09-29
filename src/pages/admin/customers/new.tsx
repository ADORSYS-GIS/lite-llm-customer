import { Spinner } from "@/components/Spinner";
import { api } from "@/utils/api";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { NextPage } from "next";

const NewCustomerPage: NextPage = () => {
	const router = useRouter();
	const [userId, setUserId] = useState("");
	const [budgetId, setBudgetId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const assignBudgetMutation = api.budget.assignBudget.useMutation({
		onSuccess: () => {
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
		<div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-bold text-slate-900 dark:text-white">LiteClient</h1>
							<nav className="hidden md:flex items-center space-x-6">
								<Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
								<Link href="/admin/customers" className="text-sm font-medium text-primary">Customers</Link>
								<Link href="/admin/budgets" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Budgets</Link>
							</nav>
						</div>
						<div className="flex items-center space-x-4">
							<button 
								type="button"
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
			<main className="flex-grow">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<div className="flex items-center gap-4 mb-4">
							<Link 
								href="/admin/customers"
								className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
							>
								← Back to Customers
							</Link>
						</div>
						<h2 className="text-3xl font-bold text-white mb-2">Add New Customer</h2>
						<p className="text-white/60">Create a new customer by assigning them to a budget</p>
					</div>

					{/* Form */}
					<div className="max-w-md">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label htmlFor="userId" className="block text-sm font-medium text-white mb-2">
									Customer Email (ID)
								</label>
								<input
									id="userId"
									type="email"
									value={userId}
									onChange={(e) => setUserId(e.target.value)}
									className="w-full px-3 py-2 border border-white/10 bg-background-dark text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
									placeholder="e.g., customer@example.com"
									required
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label htmlFor="budgetId" className="block text-sm font-medium text-white mb-2">
									Budget ID
								</label>
								<input
									id="budgetId"
									type="text"
									value={budgetId}
									onChange={(e) => setBudgetId(e.target.value)}
									className="w-full px-3 py-2 border border-white/10 bg-background-dark text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
									placeholder="e.g., free-tier"
									required
									disabled={isSubmitting}
								/>
							</div>

							{assignBudgetMutation.error && (
								<div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
									<p className="text-red-400 text-sm">
										{assignBudgetMutation.error.message}
									</p>
								</div>
							)}

							<div className="flex gap-4">
								<button
									type="submit"
									disabled={isSubmitting || !userId.trim() || !budgetId.trim()}
									className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting && <Spinner />}
									{isSubmitting ? "Creating..." : "Create Customer"}
								</button>
								
								<Link
									href="/admin/customers"
									className="px-4 py-2 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
								>
									Cancel
								</Link>
							</div>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
};

export default NewCustomerPage;
