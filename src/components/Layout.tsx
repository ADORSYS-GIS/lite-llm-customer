import type { PropsWithChildren } from "react";

export const Layout = ({ children }: PropsWithChildren) => {
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
					<a
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> dashboard </span>
						<span>Dashboard</span>
					</a>
					<a
						className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-2 font-medium text-primary text-sm"
						href="/admin/customers"
					>
						<span className="material-symbols-outlined"> group </span>
						<span>Customers</span>
					</a>
					<a
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined">
							{" "}
							account_balance_wallet{" "}
						</span>
						<span>Budgets</span>
					</a>
					<a
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> assessment </span>
						<span>Reports</span>
					</a>
					<a
						className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-black/60 text-sm transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
						href="/"
					>
						<span className="material-symbols-outlined"> settings </span>
						<span>Settings</span>
					</a>
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
				{children}
			</main>
		</div>
	);
};
