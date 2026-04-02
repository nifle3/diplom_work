import { describe, expect, it } from "vitest";
import { EmailConfigurationError, EmailDeliveryError } from "./error";
import { FileTooLargeError } from "./error/fileTooLarge";
import { StorageError } from "./error/storage";
import * as domain from "./index";
import { reportStatuses } from "./values/reportStatus";
import { Status, statusToId } from "./values/sessionStatus";

describe("domain barrel", () => {
	it("re-exports the public API", () => {
		expect(domain.EmailConfigurationError).toBe(EmailConfigurationError);
		expect(domain.EmailDeliveryError).toBe(EmailDeliveryError);
		expect(domain.FileTooLargeError).toBe(FileTooLargeError);
		expect(domain.StorageError).toBe(StorageError);
		expect(domain.reportStatuses).toBe(reportStatuses);
		expect(domain.Status).toBe(Status);
		expect(domain.statusToId).toBe(statusToId);
	});
});
