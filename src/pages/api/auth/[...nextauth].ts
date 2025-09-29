import { env } from "@/env.js";
import type { NextAuthOptions } from "next-auth";
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name: string;
			email: string;
		} & DefaultSession["user"];
	}
}

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
					return {
						id: "1",
						name: "Admin User",
						email: env.ADMIN_EMAIL,
					};
				}
				return null;
			},
		}),
	],
	secret: env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
};

export default NextAuth(authOptions);
