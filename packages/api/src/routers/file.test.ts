import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPersistentUploadLink: vi.fn(),
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
	randomUUID: vi.fn(() => "fixed-upload-id"),
}));

vi.mock("node:crypto", () => ({
	randomUUID: mocks.randomUUID,
}));

vi.mock("@diplom_work/env/server", () => ({
	env: {
		NODE_ENV: "test",
		RATE_LIMIT_ENABLE: false,
	},
}));

vi.mock("@diplom_work/ratelimit", () => ({
	globalRateLimit: {
		limit: vi.fn(),
	},
	llmRateLimit: {
		limit: vi.fn(),
	},
}));

vi.mock("@diplom_work/logger/server", () => ({
	logger: {
		info: mocks.loggerInfo,
		error: mocks.loggerError,
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

import { fileRouter } from "./file";

describe("fileRouter.getUploadLink", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPersistentUploadLink.mockResolvedValue(
			"https://storage.test/upload",
		);
	});

	it("returns a signed upload link for avatar files", async () => {
		const caller = fileRouter.createCaller({
			requestId: "req-1",
			clientIp: "127.0.0.1",
			userAgent: "vitest",
			session: {
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
			setCookieHeaders: [],
			auth: {} as never,
			db: {} as never,
			file: {
				getPersistentUploadLink: mocks.getPersistentUploadLink,
			},
			llm: {} as never,
		} as never);

		const result = await caller.getUploadLink({
			filename: "profile.avatar.png",
			contentType: "image/png",
			folder: "avatars",
		});

		expect(result).toEqual({
			url: "https://storage.test/upload",
			key: "avatars/fixed-upload-id.png",
		});
		expect(mocks.getPersistentUploadLink).toHaveBeenCalledWith(
			"avatars/fixed-upload-id.png",
			"image/png",
		);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{
				folder: "avatars",
				key: "avatars/fixed-upload-id.png",
				contentType: "image/png",
				userId: "user-1",
			},
			"Generated file upload link",
		);
	});

	it("uses the last extension segment when building the storage key", async () => {
		const caller = fileRouter.createCaller({
			requestId: "req-2",
			clientIp: "127.0.0.1",
			userAgent: "vitest",
			session: {
				user: {
					id: "user-2",
				},
				session: {
					role: "expert",
				},
			},
			setCookieHeaders: [],
			auth: {} as never,
			db: {} as never,
			file: {
				getPersistentUploadLink: mocks.getPersistentUploadLink,
			},
			llm: {} as never,
		} as never);

		await caller.getUploadLink({
			filename: "script.backup.tar.gz",
			contentType: "application/gzip",
			folder: "scripts",
		});

		expect(mocks.getPersistentUploadLink).toHaveBeenCalledWith(
			"scripts/fixed-upload-id.gz",
			"application/gzip",
		);
	});
});
