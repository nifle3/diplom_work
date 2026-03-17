import { getPersistentUploadLink } from "@diplom_work/file";
import { randomUUID } from "crypto";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const input = z.object({
	filename: z.string(),
	contentType: z.string(),
	folder: z.enum(["avatars", "products", "chat_images"]),
});

export const fileRouter = router({
	getUploadLink: protectedProcedure.input(input).mutation(async ({ input }) => {
		const ext = input.filename.split(".").pop();
		const key = `${input.folder}/${randomUUID()}.${ext}`;
		const url = getPersistentUploadLink(key, input.contentType);

		return { url, key };
	}),
});
