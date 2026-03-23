import { randomUUID } from "node:crypto";
import { auth } from "@diplom_work/auth";
import type { NextRequest } from "next/server";

function getClientIp(req: NextRequest) {
	const forwardedFor = req.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? null;
	}

	return req.headers.get("x-real-ip");
}

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	const requestId = req.headers.get("x-request-id") ?? randomUUID();
	const clientIp = getClientIp(req);
	const userAgent = req.headers.get("user-agent");

	return {
		session,
		requestId,
		clientIp,
		userAgent,
		setCookieHeaders: [] as string[],
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
