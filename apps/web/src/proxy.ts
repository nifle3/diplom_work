import type { NextRequest } from "next/server";

function isAuthenticated(request: NextRequest): boolean {
	if (isNonAuthPage(request.nextUrl.pathname)) {
		return true;
	}

	return checkCookie(request);
}

function isNonAuthPage(url: string): boolean {
	const nonAuthPages = [
		"/",
		"/signIn",
		"/signUp",
		"/forgotPassword",
		"/resetPassword",
		"/static",
	];

	const isNonAuthPage = nonAuthPages.some((value) => url === value, url);

	return isNonAuthPage;
}

function checkCookie(request: NextRequest): boolean {
	return (
		request.cookies.has("better-auth.session_token") &&
		request.cookies.has("better-auth.session_data")
	);
}

export default function proxy(request: NextRequest) {
	if (!isAuthenticated(request)) {
		return Response.json(
			{ success: false, message: "authentication failed" },
			{ status: 401 },
		);
	}

	return undefined;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
