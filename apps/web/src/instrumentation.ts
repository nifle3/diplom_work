export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const { startupHealthcheck } = await import("@diplom_work/healthcheck");

	try {
		await startupHealthcheck();
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log(error.message);
		} else {
			console.log("unknown error");
		}
		throw error;
	}
}
