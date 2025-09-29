import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type CreateBudgetForm = {
	budget_id: string;
	max_budget: number;
	budget_duration?: string;
};

const CreateBudgetPage: NextPage = () => {
	const router = useRouter();
	const { register, handleSubmit } = useForm<CreateBudgetForm>({
	defaultValues: {
		budget_duration: 'monthly'
	}
});
	const createBudget = api.budget.createBudget.useMutation();

	const onSubmit = (data: CreateBudgetForm) => {
		createBudget.mutate(data, {
			onSuccess: () => {
				router.push("/admin/budgets");
			},
			onError: (error) => {
				console.error("Failed to create budget:", error);
			},
		});
	};

	return (
		<Layout>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h1 className="font-bold text-3xl text-white tracking-tight">
					Create Budget
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="budget_id"
							className="block font-medium text-white text-sm"
						>
							Budget ID
						</label>
						<div className="mt-1">
							<input
								id="budget_id"
								{...register("budget_id", { required: true })}
								className="w-full rounded-lg border-white/10 bg-background-dark py-2 pr-4 pl-4 text-white text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="max_budget"
							className="block font-medium text-white text-sm"
						>
							Max Budget
						</label>
						<div className="mt-1">
							<input
								id="max_budget"
								type="number"
								{...register("max_budget", {
									required: true,
									valueAsNumber: true,
								})}
								className="w-full rounded-lg border-white/10 bg-background-dark py-2 pr-4 pl-4 text-white text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="budget_duration"
							className="block font-medium text-white text-sm"
						>
							Reset Interval
						</label>
						<select
							id="budget_duration"
							{...register("budget_duration")}
							className="mt-1 block w-full rounded-lg border-white/10 bg-background-dark py-2 pl-3 pr-10 text-white text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2"
						>
							<option value="">Never (one-time budget)</option>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly" selected>Monthly</option>
							<option value="quarterly">Quarterly</option>
							<option value="yearly">Yearly</option>
						</select>
					</div>
					<button
						type="submit"
						className="flex items-center gap-2 rounded-lg border border-white/10 bg-background-dark px-4 py-2 font-medium text-white text-sm transition-colors hover:bg-white/5"
						disabled={createBudget.isPending}
					>
						{createBudget.isPending ? "Creating..." : "Create Budget"}
					</button>
				</form>
			</div>
		</Layout>
	);
};

export default CreateBudgetPage;
