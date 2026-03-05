import { deepseek } from "@ai-sdk/deepseek";
import { wrapLanguageModel } from "ai";

import { shieldUserTextMiddleware } from "./middlewares";

const provider = deepseek("deepseek-chat");
export const model = wrapLanguageModel({
    model: provider,
    middleware: [shieldUserTextMiddleware]
});
