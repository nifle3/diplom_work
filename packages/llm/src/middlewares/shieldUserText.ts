import type { LanguageModelV3Middleware } from "@ai-sdk/provider";

export const shieldUserTextMiddleware: LanguageModelV3Middleware = {
    transformParams: async ({ params }) => {
        const newPrompts = [];

        params.prompt = newPrompts;
        
        return params;      
    }
};