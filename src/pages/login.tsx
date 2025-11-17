import { signIn } from "next-auth/react";

const LoginPage = () => {
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
								Welcome
							</h2>
							<p className="mt-2 text-slate-600 dark:text-slate-400">
								Sign in to continue
							</p>
						</div>
						<button
							type="button"
							className="w-full rounded-lg border border-transparent bg-primary px-4 py-3 font-medium text-sm text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							onClick={() => signIn("keycloak", { callbackUrl: "/" })}
						>
							Login with Keycloak
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
