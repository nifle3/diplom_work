import { randomUUID } from "node:crypto";
import { z } from "zod";
import { protectedProcedure, router } from "../init/routers";

const input = z.object({
	filename: z.string(),
	contentType: z.string(),
	folder: z.enum(["avatars", "scripts"]),
});

export const fileRouter = router({
	getUploadLink: protectedProcedure.input(input).mutation(async ({ input, ctx }) => {
		const ext = input.filename.split(".").pop();
		const key = `${input.folder}/${randomUUID()}.${ext}`;
		const url = await ctx.file.getPersistentUploadLink(key, input.contentType);

		return { url, key };
	}),
});
