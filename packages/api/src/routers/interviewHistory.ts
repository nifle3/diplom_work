import { db } from "@diplom_work/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "..";

export const interviewHistoryRouter = router({
	getAllComplete: protectedProcedure
		.input(z.uuid())
		.query(async ({ input, ctx }) => {
			const result = await db.query.interviewSessionsTable.findMany({
				where: (interviewSessionsTable, { eq, and }) =>
					and(
						eq(interviewSessionsTable.scriptId, input),
						eq(interviewSessionsTable.userId, ctx.session.user.id),
						eq(interviewSessionsTable.status, "complete"),
					),
			});

			if (!result) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return result;
		}),
	getAllIncomplete: protectedProcedure
		.input(z.uuid())
		.query(async ({ input, ctx }) => {}),
});
