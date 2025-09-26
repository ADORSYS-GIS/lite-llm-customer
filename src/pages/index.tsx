import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminPage() {
	return (
		<div>
			<h1>Admin Dashboard</h1>
			<Link href="/admin/customers">Customers</Link>
			<button type="button" onClick={() => signOut()}>
				Sign Out
			</button>
		</div>
	);
}
