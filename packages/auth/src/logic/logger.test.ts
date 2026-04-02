import { describe, expect, it, vi } from "vitest";
import { createLoggerBridge } from "./logger";

describe("createLoggerBridge", () => {
	it("should bridge log calls to the internal logger correctly", () => {
		const mockInternalLogger = {
			error: vi.fn(),
			warn: vi.fn(),
			info: vi.fn(),
			debug: vi.fn(),
		};

		const bridge = createLoggerBridge({ logger: mockInternalLogger });

		bridge("info", "Test message", { extra: "data" });
		expect(mockInternalLogger.info).toHaveBeenCalledWith("[info] Test message", { extra: "data" });

		bridge("error", "Error occurred", new Error("fail"));
		expect(mockInternalLogger.error).toHaveBeenCalledWith("[error] Error occurred", expect.any(Error));

		bridge("warn", "Warning");
		expect(mockInternalLogger.warn).toHaveBeenCalledWith("[warn] Warning");

		bridge("debug", "Debug info");
		expect(mockInternalLogger.debug).toHaveBeenCalledWith("[debug] Debug info");
	});
});
