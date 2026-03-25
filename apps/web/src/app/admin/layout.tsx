import { RedirectType, redirect } from "next/navigation";

import PrivateHeader from "@/components/privateHeader";
import { auth } from "@diplom_work/auth";
import { headers } from "next/headers";

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

	if (session.session.role !== "expert") {
		redirect("/dashboard", RedirectType.replace);
	}


	return (
		<>
			<PrivateHeader username={session.user.name} email={session.user.email} role={session.session.role}/>
			{settings}
		</>
	);
}
