import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const globalRateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(20, "10 s"),
	analytics: true,
	prefix: "ratelimit:global",
});

export const llmRateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, "1 m"),
	analytics: true,
	prefix: "ratelimit:llm",
});

export const emailRateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(3, "1 h"),
	analytics: true,
	prefix: "ratelimit:email",
});

export const pageRateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(30, "1 m"),
	analytics: true,
	prefix: "ratelimit:page",
});
