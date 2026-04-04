import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@diplom_work/api/routers/index";
import superjson from "superjson";
import type { LoadTestArgs, LoadTestClient } from "./types.ts";

function normalizeBaseUrl(baseUrl: string) {
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function buildClient({
	baseUrl,
	cookie,
	headersJson,
	timeoutMs,
}: Pick<LoadTestArgs, "baseUrl" | "cookie" | "headersJson" | "timeoutMs">) {
	let extraHeaders: Record<string, string> = {};

	if (headersJson.trim()) {
		try {
			extraHeaders = JSON.parse(headersJson) as Record<string, string>;
		} catch (error) {
			throw new Error(
				`LOADTEST_HEADERS_JSON must be valid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	if (
		extraHeaders === null ||
		typeof extraHeaders !== "object" ||
		Array.isArray(extraHeaders)
	) {
		throw new Error("LOADTEST_HEADERS_JSON must be an object");
	}

	const headers: Record<string, string> = {};
	if (cookie.trim()) {
		headers.cookie = cookie.trim();
	}
	Object.assign(headers, extraHeaders);

	return createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${normalizeBaseUrl(baseUrl)}/api/trpc`,
				transformer: superjson,
				headers() {
					return headers;
				},
				fetch: (url, options) => {
					const requestTimeout = AbortSignal.timeout(timeoutMs);
					const signal = options?.signal
						? AbortSignal.any([options.signal, requestTimeout])
						: requestTimeout;

					return fetch(url, {
						...options,
						signal,
					});
				},
			}),
		],
	}) as LoadTestClient;
}
