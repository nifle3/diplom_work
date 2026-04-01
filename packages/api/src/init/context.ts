import { randomUUID } from "node:crypto";
import { defaultDependencies, type AppDependencies } from "./dependencies";

type RequestLike = {
	headers: Pick<Headers, "get" | "entries">;
};

type AuthHeadersLike = Record<string, string>;

function getClientIp(req: RequestLike) {
	const forwardedFor = req.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? null;
	}

	return req.headers.get("x-real-ip");
}

export async function createContext(
	req: RequestLike,
	dependencies: AppDependencies = defaultDependencies,
) {
	const session = await dependencies.auth.api.getSession({
		headers: Object.fromEntries(req.headers.entries()) as AuthHeadersLike,
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
		auth: dependencies.auth,
		db: dependencies.db,
		file: dependencies.file,
		llm: dependencies.llm,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
