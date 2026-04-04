export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const [{ logger }, { startupHealthcheck }] = await Promise.all([
		import("@diplom_work/logger/server"),
		import("@diplom_work/healthcheck"),
	]);

	try {
		logger.info("Next.js instrumentation initialized");
		await startupHealthcheck();
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error({ error }, "Startup healthcheck failed");
		} else {
			logger.error({ error }, "Startup healthcheck failed");
		}
		throw error;
	}
}
