import { headers } from "next/headers";
import { auth } from "@diplom_work/auth";

export async function serverContext() {
  const h = await headers(); 

  const headersObj = Object.fromEntries(h.entries());

  const session = await auth.api.getSession({
    headers: headersObj,
  });

  return {
    session,
    setCookieHeaders: [] as string[],
  };
}