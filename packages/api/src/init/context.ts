import { randomUUID } from "node:crypto";
import { auth } from "@diplom_work/auth";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	const requestId = req.headers.get("x-request-id") ?? randomUUID();

	return {
		session,
		requestId,
		setCookieHeaders: [] as string[],
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
