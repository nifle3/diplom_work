import { describe, it, expect, vi } from "vitest";

vi.mock("./model", () => ({
	model: {},
}));

import * as exports from "./index";

describe("llm index", () => {
	it("should export necessary functions", () => {
		expect(exports).toHaveProperty("evaluateAnswer");
		expect(exports).toHaveProperty("getFirstQuestion");
		expect(exports).toHaveProperty("getNextQuestion");
		expect(exports).toHaveProperty("planInterviewStep");
		expect(exports).toHaveProperty("summarize");
	});
});
