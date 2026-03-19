import { startupHealthcheck } from "@diplom_work/healthcheck";

export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") {
        return;
    }

    await startupHealthcheck();
}