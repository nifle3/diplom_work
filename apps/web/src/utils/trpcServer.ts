import { appRouter } from "@diplom_work/api/routers/index";
import { serverContext } from "./serverContext";

export async function serverTrpc() {
  const ctx = await serverContext();
  return appRouter.createCaller(ctx);
}