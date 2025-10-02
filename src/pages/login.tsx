import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { error: urlError } = router.query;

	useEffect(() => {
		// Handle error from URL (e.g., from unauthorized redirect)
		if (urlError === "CredentialsSignin") {
			setError("Invalid email or password. Please try again.");
		}
	}, [urlError]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await signIn("credentials", {
			redirect: false,
			email,
			password,
		});

		if (result?.ok) {
			router.push("/");
		} else {
			setError("Invalid email or password. Please try again.");
			setPassword(""); // Clear password field on error
		}
	};

	return (
		<div className="bg-background-light font-display text-slate-800 dark:bg-background-dark dark:text-slate-200">
			<div className="flex min-h-screen flex-col items-center justify-center px-4">
				<div className="mx-auto w-full max-w-md sm:max-w-sm">
					<div className="mb-8 text-center">
						<h1 className="font-bold text-3xl text-slate-900 dark:text-white">
							LiteClient
						</h1>
					</div>
					<div className="rounded-xl bg-white p-6 shadow-md dark:bg-slate-900/50">
						<div className="mb-6 text-center">
							<h2 className="font-bold text-2xl text-slate-900 dark:text-white">
								Welcome Back
							</h2>
							<p className="mt-2 text-slate-600 dark:text-slate-400">
								Sign in to continue
							</p>
							{error && (
								<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
									<div className="flex">
										<div className="flex-shrink-0">
											<svg
												className="h-5 w-5 text-red-400"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
												role="img"
												aria-label="Error"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div className="ml-3">
											<h3 className="font-medium text-red-800 text-sm dark:text-red-200">
												{error}
											</h3>
										</div>
									</div>
								</div>
							)}
						</div>
						<form className="space-y-6" onSubmit={handleSubmit}>
							<div>
								<label
									className="block font-medium text-slate-700 text-sm dark:text-slate-300"
									htmlFor="email"
								>
									Email
								</label>
								<div className="mt-1">
									<input
										className="form-input w-full rounded-lg border-slate-300 bg-background-light text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-background-dark dark:text-white dark:placeholder:text-slate-500"
										id="email"
										name="email"
										placeholder="you@example.com"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
							</div>
							<div>
								<label
									className="block font-medium text-slate-700 text-sm dark:text-slate-300"
									htmlFor="password"
								>
									Password
								</label>
								<div className="mt-1">
									<input
										className="form-input w-full rounded-lg border-slate-300 bg-background-light text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-background-dark dark:text-white dark:placeholder:text-slate-500"
										id="password"
										name="password"
										placeholder="••••••••"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</div>
							</div>
							<div>
								<button
									className="w-full rounded-lg border border-transparent bg-primary px-4 py-3 font-medium text-sm text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
									type="submit"
								>
									Login
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
