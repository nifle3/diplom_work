import { startupHealthcheck } from "@diplom_work/healthcheck";

export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	try {
		await startupHealthcheck();
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log(error.message);
		} else {
			console.log("unkown error");
		}
		throw error;
	}
}
