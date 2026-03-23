import { pageRateLimit } from "@diplom_work/ratelimit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getClientFingerprint(req: NextRequest) {
	const forwardedFor = req.headers.get("x-forwarded-for");
	const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown-ip";
	const userAgent = req.headers.get("user-agent") ?? "unknown-ua";

	return `${ip}:${userAgent}`;
}

function isPageRequest(req: NextRequest) {
	if (req.method !== "GET" && req.method !== "HEAD") {
		return false;
	}

	const accept = req.headers.get("accept") ?? "";
	return accept.includes("text/html");
}

export async function proxy(req: NextRequest) {
	if (!isPageRequest(req)) {
		return NextResponse.next();
	}

	const result = await pageRateLimit.limit(getClientFingerprint(req));

	if (!result.success) {
		const url = req.nextUrl.clone();
		url.pathname = "/too-many-requests";
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|too-many-requests|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2)$).*)",
	],
};
