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
	const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
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
				url: `${normalizedBaseUrl}/api/trpc`,
				transformer: superjson,
				headers() {
					return headers;
				},
				fetch: async (url, options) => {
					const requestTimeout = AbortSignal.timeout(timeoutMs);
					const signal = options?.signal
						? AbortSignal.any([options.signal, requestTimeout])
						: requestTimeout;

					try {
						return await fetch(url, {
							...options,
							signal,
						});
					} catch (error) {
						const reason =
							error instanceof Error
								? error.cause instanceof Error
									? `${error.message}: ${error.cause.message}`
									: error.message
								: "Unknown network error";
						throw new Error(
							`Failed to fetch ${url.toString()} from ${normalizedBaseUrl}: ${reason}`,
							{ cause: error },
						);
					}
				},
			}),
		],
	}) as LoadTestClient;
}
