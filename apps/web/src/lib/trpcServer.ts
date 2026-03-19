import { randomUUID } from "node:crypto";
import { appRouter } from "@diplom_work/api/routers/index";
import { auth } from "@diplom_work/auth";
import { headers } from "next/headers";

async function serverContext() {
	const h = await headers();

	const headersObj = Object.fromEntries(h.entries());

	const requestId = headersObj["x-request-id"] ?? randomUUID();

	const session = await auth.api.getSession({
		headers: h,
	});

	return {
		session,
		requestId,
		setCookieHeaders: [] as string[],
	};
}

export async function serverTrpc() {
	const ctx = await serverContext();
	return appRouter.createCaller(ctx);
}
