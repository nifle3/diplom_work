/**
 * Creates a bridge between Better-Auth logger and our internal logger.
 */
export const createLoggerBridge = (deps: {
	logger: {
		error: (...args: any[]) => void;
		warn: (...args: any[]) => void;
		info: (...args: any[]) => void;
		debug: (...args: any[]) => void;
	};
}) => {
	return (level: "error" | "warn" | "info" | "debug", message: string, ...args: any[]) => {
		switch (level) {
			case "error":
				deps.logger.error(`[${level}] ${message}`, ...args);
				break;
			case "warn":
				deps.logger.warn(`[${level}] ${message}`, ...args);
				break;
			case "info":
				deps.logger.info(`[${level}] ${message}`, ...args);
				break;
			case "debug":
				deps.logger.debug(`[${level}] ${message}`, ...args);
				break;
		}
	};
};
