import { count, eq } from "drizzle-orm";

import { db } from "@diplom_work/db/index";
import {
	interviewSessionsTable,
	userAchievementsTable,
} from "@diplom_work/db/schema/scheme";

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";

export const profileRouter = router({
	getMyProfile: protectedProcedure.query(async ({ ctx }) => {
		const user = await db.query.usersTable.findFirst({
			where: (usersTable, { and, eq, isNull }) =>
				and(
					eq(usersTable.id, ctx.session.user.id),
					isNull(usersTable.deletedAt),
				),
		});

		if (!user) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return user;

	}),
	getMyProfileStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const { 0: interviewCountResult } = await db
			.select({ count: count() })
			.from(interviewSessionsTable)
			.where(eq(interviewSessionsTable.userId, userId));

		const { 0: achievementCountResult } = await db
			.select({ count: count() })
			.from(userAchievementsTable)
			.where(eq(userAchievementsTable.userId, userId));

		return {
			interviewCount: interviewCountResult?.count ?? 0,
			achievementCount: achievementCountResult?.count ?? 0,
		};
	}),
	getMyHistory: protectedProcedure.query(async ({ ctx }) => {
		const sessions = await db.query.interviewSessionsTable.findMany({
			where: (interviewSessionsTable, { eq }) =>
				eq(interviewSessionsTable.userId, ctx.session.user.id),
			columns: {
				id: true,
				status: true,
				finalScore: true,
				expertFeedback: true,
				startedAt: true,
				finishedAt: true,
			},
			with: {
				script: {
					columns: {
						id: true,
						title: true,
					},
				},
			},
			orderBy: (interviewSessionsTable, { desc }) => [
				desc(interviewSessionsTable.startedAt),
			],
		});

		return sessions;
	}),
	getMyAchivements: protectedProcedure.query(async ({ ctx }) => {
		const achievements = await db.query.userAchievementsTable.findMany({
			where: (userAchievementsTable, { eq }) =>
				eq(userAchievementsTable.userId, ctx.session.user.id),
			columns: {
				awardedAt: true,
			},
			with: {
				achievement: {
					columns: {
						id: true,
						name: true,
						description: true,
						iconUrl: true,
					},
				},
			},
			orderBy: (userAchievementsTable, { desc }) => [
				desc(userAchievementsTable.awardedAt),
			],
		});

		return achievements;
	}),
});
