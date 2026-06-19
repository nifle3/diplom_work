import { auth } from "@diplom_work/auth/index";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import PrivateHeader from "@/components/privateHeader";

export default async function UnauthLayout({
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

	return (
		<div className="grid h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
			<PrivateHeader
				role={session.session.role}
				username={session.user.name}
				email={session.user.email}
			/>
			<main className="min-h-0 overflow-y-auto">{children}</main>
		</div>
	);
}
