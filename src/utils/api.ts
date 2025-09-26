import type { AppRouter } from "@/server/api/root";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return ""; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const api = createTRPCReact<AppRouter>();

export const trpcClient = api.createClient({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
			transformer: superjson,
		}),
	],
});
