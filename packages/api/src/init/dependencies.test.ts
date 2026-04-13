import { describe, expect, it, vi } from "vitest";

vi.mock("@diplom_work/auth", () => ({
	auth: {},
}));

vi.mock("@diplom_work/db", () => ({
	db: {},
}));

vi.mock("@diplom_work/file", () => ({
	getPersistentLink: vi.fn(),
	getPersistentUploadLink: vi.fn(),
}));

vi.mock("@diplom_work/llm", () => ({
	evaluateAnswer: vi.fn(),
	planInterviewStep: vi.fn(),
	summarize: vi.fn(),
}));
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
