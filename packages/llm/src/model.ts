import { createMistral } from "@ai-sdk/mistral";
import { env } from "@diplom_work/env/server";
import { wrapLanguageModel } from "ai";
import { shieldUserTextMiddleware } from "./middlewares";

const mistral = createMistral({
	apiKey: env.AI_KEY,
});
const provider = mistral("mistral-medium-2508");
export const model = wrapLanguageModel({
	model: provider,
	middleware: [shieldUserTextMiddleware],
});
