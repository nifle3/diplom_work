import { describe, expect, it } from "vitest";
import { defaultDependencies } from "./dependencies";

describe("defaultDependencies", () => {
	it("exposes the shared service clients", () => {
		expect(defaultDependencies.auth).toBeTruthy();
		expect(defaultDependencies.db).toBeTruthy();
		expect(defaultDependencies.file).toEqual(
			expect.objectContaining({
				getPersistentLink: expect.any(Function),
				getPersistentUploadLink: expect.any(Function),
			}),
		);
		expect(defaultDependencies.llm).toEqual(
			expect.objectContaining({
				evaluateAnswer: expect.any(Function),
				planInterviewStep: expect.any(Function),
				summarize: expect.any(Function),
			}),
		);
	});
});
