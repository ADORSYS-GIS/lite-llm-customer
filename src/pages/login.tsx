import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

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
			// Handle login error
			console.error("Login failed");
		}
	};

	return (
		<div className="bg-background-light font-display text-slate-800 dark:bg-background-dark dark:text-slate-200">
			<div className="flex min-h-screen flex-col items-center justify-center px-4">
				<div className="mx-auto w-full max-w-sm">
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
									className="flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 font-medium text-sm text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
