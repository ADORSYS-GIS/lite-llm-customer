import { env } from "@/env.js";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (
					credentials?.email === env.ADMIN_EMAIL &&
					credentials?.password === env.ADMIN_PASSWORD
				) {
					return { id: "1", name: "Admin", email: env.ADMIN_EMAIL };
				}
				return null;
			},
		}),
	],
	secret: env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
