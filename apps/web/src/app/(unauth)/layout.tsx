import { auth } from "@diplom_work/auth/index";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import PublicHeader from "@/components/publicHeader";

export default async function UnauthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard", RedirectType.replace);
	}

	return (
		<>
			<PublicHeader />
			{children}
		</>
	);
}
