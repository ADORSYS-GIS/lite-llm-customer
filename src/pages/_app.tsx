import "@/styles/globals.css";
import { api, trpcClient } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

const MyApp = ({
	Component,
	pageProps,
}: AppProps<{ session: Session | null }>) => {
	return (
		<api.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider session={pageProps.session}>
					<Component {...pageProps} />
				</SessionProvider>
			</QueryClientProvider>
		</api.Provider>
	);
};

export default MyApp;
