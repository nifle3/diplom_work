import { randomUUID } from "node:crypto";
import { logger } from "@diplom_work/logger/server";
import { z } from "zod";
import { protectedProcedure, router } from "../init/routers";

const input = z.object({
	filename: z.string(),
	contentType: z.string(),
	folder: z.enum(["avatars", "scripts"]),
});

export const fileRouter = router({
	getUploadLink: protectedProcedure
		.input(input)
		.mutation(async ({ input, ctx }) => {
			const ext = input.filename.split(".").pop();
			const key = `${input.folder}/${randomUUID()}.${ext}`;
			const url = await ctx.file.getPersistentUploadLink(
				key,
				input.contentType,
			);

			logger.info(
				{
					folder: input.folder,
					key,
					contentType: input.contentType,
					userId: ctx.session.user.id,
				},
				"Generated file upload link",
			);

			return { url, key };
		}),
});
