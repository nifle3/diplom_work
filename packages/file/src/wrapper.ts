import { FileTooLargeError, StorageError } from "@diplom_work/domain/error";

export function wrapS3Error<Args extends unknown[], Return>(
	fn: (...args: Args) => Promise<Return>,
): (...args: Args) => Promise<Return> {
	return async (...args: Args): Promise<Return> => {
		try {
			return await fn(...args);
		} catch (err: unknown) {
			if (!(err instanceof Error)) {
				throw new StorageError("Unknown S3 storage error", {
					what: "unknown",
					who: "s3",
				});
			}

			if (err.name === "EntityTooLarge") {
				throw new FileTooLargeError(err.message, "File too large");
			}

			throw new StorageError(err.message, {
				what: err.name || "Error",
				who: "s3",
			});
		}
	};
}
