import { auth } from "@diplom_work/auth";
import { headers } from "next/headers";

export async function serverContext() {
	const h = await headers();

	const headersObj = Object.fromEntries(h.entries());

	const session = await auth.api.getSession({
		headers: headersObj,
	});

	return {
		session,
		setCookieHeaders: [] as string[],
	};
}
