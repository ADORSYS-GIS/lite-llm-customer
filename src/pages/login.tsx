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
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">LiteClient</h1>
          </div>
          <div className="bg-white dark:bg-slate-900/50 shadow-md rounded-xl p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to continue</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email</label>
                <div className="mt-1">
                  <input
                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                <div className="mt-1">
                  <input
                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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