import { createContext } from "@diplom_work/api/init/context";
import { defaultDependencies } from "@diplom_work/api/init/dependencies";
import { appRouter } from "@diplom_work/api/routers/index";
import { headers } from "next/headers";

export async function serverTrpc() {
	const h = await headers();
	const ctx = await createContext({ headers: h }, defaultDependencies);
	return appRouter.createCaller(ctx);
}
