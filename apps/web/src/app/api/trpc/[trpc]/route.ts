import { createContext } from "@diplom_work/api/init/context";
import { defaultDependencies } from "@diplom_work/api/init/dependencies";
import { appRouter } from "@diplom_work/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req, defaultDependencies),
	});
}
export { handler as GET, handler as POST };
