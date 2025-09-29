import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

export const Layout = ({ children }: PropsWithChildren) => {
	const router = useRouter();
	const { data: session } = useSession();

	const isActive = (path: string) => {
		return router.pathname.startsWith(path)
			? "bg-primary/10 text-primary"
			: "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5";
	};
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
						href="/"
						className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${isActive("/")}`}
					>
						<span className="material-symbols-outlined" />
						<span>Dashboard</span>
					</Link>
					<Link
						href="/admin/customers"
						className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${isActive("/admin/customers")}`}
					>
						<span className="material-symbols-outlined" />
						<span>Customers</span>
					</Link>
					<Link
						href="/admin/budgets"
						className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${isActive("/admin/budgets")}`}
					>
						<span className="material-symbols-outlined" />
						<span>Budgets</span>
					</Link>
					<Link
						href="/admin/reports"
						className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${isActive("/admin/reports")}`}
					>
						<span className="material-symbols-outlined" />
						<span>Reports</span>
					</Link>
					<Link
						href="/admin/settings"
						className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${isActive("/admin/settings")}`}
					>
						<span className="material-symbols-outlined" />
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
								{session?.user?.name || "User"}
							</p>
							<p className="text-black/60 text-xs dark:text-white/60">
								{session?.user?.email || "No email"}
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
