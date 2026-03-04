import { env } from "@diplom_work/env/server";

import { ChatDeepSeek } from "@langchain/deepseek";

if (!env.AI_KEY) {
    throw new Error("AI key is undefined");
}

export const model = new ChatDeepSeek({
    model: "deepseek-chat",
    temperature: env.AI_TEMPERATURE,
    apiKey: env.AI_KEY,
});