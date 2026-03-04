import { RedirectType, redirect } from "next/navigation";

import PrivateHeader from "@/components/privateHeader";
import { serverTrpc } from "@/lib/trpcServer";
import { AdminSidebar } from "./_components/sidebar";

export default async function AdminLayout({
	settings,
}: Readonly<{
	settings: React.ReactNode;
}>) {
	const trpcCaller = await serverTrpc();

	const isUserAdmin = await trpcCaller.user.isUserHasRole("admin");
	if (!isUserAdmin) {
		redirect("/dashboard", RedirectType.replace);
	}

	return (
		<>
			<PrivateHeader/>
			<div className="flex min-h-screen">
				<AdminSidebar />
				<main className="flex-1">{settings}</main>
			</div>
		</>
	);
}
