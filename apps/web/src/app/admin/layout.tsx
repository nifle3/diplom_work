import { auth } from "@diplom_work/auth";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import PrivateHeader from "@/components/privateHeader";
import { AdminSidebar } from "./_components/sidebar";

export default async function Layout({
	settings,
}: Readonly<{
	settings: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.session.role) {
		redirect("/", RedirectType.replace);
	}

	if (session.session.role !== "admin") {
		redirect("/dashboard", RedirectType.replace);
	}

	return (
		<>
			<PrivateHeader
				username={session.user.name}
				email={session.user.email}
				role={session.session.role}
			/>
			<div className="flex flex-1 overflow-hidden">
				<AdminSidebar />
				<main className="flex flex-1 flex-col overflow-y-auto">
					<div className="flex-1 px-4 py-6">{settings}</div>
					<footer className="border-t py-6 text-center text-muted-foreground text-sm">
						diplom_work
					</footer>
				</main>
			</div>
		</>
	);
}
