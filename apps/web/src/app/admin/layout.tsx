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
			<AdminSidebar />
			<main className="ml-64 min-h-[calc(100vh-5rem)] px-4 py-6">
				{settings}
				<footer className="mt-8 border-t pt-4 pb-2 text-center text-muted-foreground text-xs">
					diplom_work
				</footer>
			</main>
		</>
	);
}
