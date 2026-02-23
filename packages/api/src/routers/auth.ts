import { TRPCError } from "@trpc/server";
import { auth } from "@diplom_work/auth";
import { env } from "@diplom_work/env/server";
import type { Context } from "../context";
import { publicProcedure, router } from "../index";
import { z } from "zod";

const AUTH_BASE_PATH = "/api/auth";

const parseAuthResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to parse authentication response",
      cause: error,
    });
  }
};

const gatherSetCookies = (headers: Headers) => {
  const cookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value);
    }
  });
  return cookies;
};

const callBetterAuth = async (path: string, body: Record<string, unknown>) => {
  const request = new Request(new URL(path, env.BETTER_AUTH_URL).toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      origin: env.CORS_ORIGIN,
    },
    body: JSON.stringify(body),
  });
  const response = await auth.handler(request);
  const parsed = await parseAuthResponse(response);
  if (!response.ok) {
    const message = parsed?.message ?? parsed?.error ?? "Authentication failed";
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
    });
  }
  return {
    body: parsed,
    headers: response.headers,
  };
};

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const attachCookies = (ctx: Context, headers: Headers) => {
  if (!ctx.setCookieHeaders) return;
  ctx.setCookieHeaders.push(...gatherSetCookies(headers));
};

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const { body, headers } = await callBetterAuth(`${AUTH_BASE_PATH}/sign-up/email`, {
      name: input.name,
      email: input.email,
      password: input.password,
      rememberMe: true,
    });
    attachCookies(ctx, headers);
    return body;
  }),
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { body, headers } = await callBetterAuth(`${AUTH_BASE_PATH}/sign-in/email`, {
      email: input.email,
      password: input.password,
      rememberMe: true,
    });
    attachCookies(ctx, headers);
    return body;
  }),
});
