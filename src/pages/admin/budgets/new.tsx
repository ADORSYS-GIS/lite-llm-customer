import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type CreateBudgetForm = {
	budget_id: string;
	max_budget: number;
	currency: string;
	reset_interval: string;
};

const CreateBudgetPage: NextPage = () => {
	const router = useRouter();
	const { register, handleSubmit } = useForm<CreateBudgetForm>();
	const createBudget = api.budget.createBudget.useMutation();

	const onSubmit = (data: CreateBudgetForm) => {
		createBudget.mutate(data, {
			onSuccess: () => {
				router.push("/admin/customers");
			},
		});
	};

	return (
		<Layout>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h1 className="font-bold text-3xl text-black tracking-tight dark:text-white">
					Create Budget
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="budget_id"
							className="block font-medium text-gray-700 text-sm dark:text-gray-200"
						>
							Budget ID
						</label>
						<div className="mt-1">
							<input
								id="budget_id"
								{...register("budget_id", { required: true })}
								className="w-full rounded-lg border-black/10 bg-white py-2 pr-4 pl-4 text-black text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-background-dark dark:text-white dark:focus:border-primary"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="max_budget"
							className="block font-medium text-gray-700 text-sm dark:text-gray-200"
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
								className="w-full rounded-lg border-black/10 bg-white py-2 pr-4 pl-4 text-black text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-background-dark dark:text-white dark:focus:border-primary"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="currency"
							className="block font-medium text-gray-700 text-sm dark:text-gray-200"
						>
							Currency
						</label>
						<div className="mt-1">
							<input
								id="currency"
								{...register("currency", { required: true })}
								className="w-full rounded-lg border-black/10 bg-white py-2 pr-4 pl-4 text-black text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-background-dark dark:text-white dark:focus:border-primary"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="reset_interval"
							className="block font-medium text-gray-700 text-sm dark:text-gray-200"
						>
							Reset Interval
						</label>
						<div className="mt-1">
							<input
								id="reset_interval"
								{...register("reset_interval", { required: true })}
								className="w-full rounded-lg border-black/10 bg-white py-2 pr-4 pl-4 text-black text-sm ring-primary/50 transition-all focus:border-primary focus:ring-2 dark:border-white/10 dark:bg-background-dark dark:text-white dark:focus:border-primary"
							/>
						</div>
					</div>
					<button
						type="submit"
						className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 font-medium text-black text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-background-dark dark:text-white dark:hover:bg-white/5"
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
