import { RedirectType, redirect } from "next/navigation";

import PrivateHeader from "@/components/privateHeader";
import { headers } from "next/headers";
import { auth } from "@diplom_work/auth";


export default async function ExpertLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.session.role) {
		redirect("/", RedirectType.replace);
	}

	if (session.session.role !== "expert") {
		redirect("/dashboard", RedirectType.replace);
	}


	return (
		<>
			<PrivateHeader username={session.user.name} email={session.user.email} role={session.session.role}/>
			{children}
		</>
	);
}
