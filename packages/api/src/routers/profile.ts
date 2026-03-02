import { count, eq, and, isNull, desc } from "drizzle-orm";

import { db } from "@diplom_work/db";
import {
	achievementsTable,
	interviewSessionsTable,
	userAchievementsTable,
	usersTable,
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

		const { 0: result } = await db
			.select({
				currentStreak: usersTable.currentStreak,
				xp: usersTable.xp,
				interviewCount: count(interviewSessionsTable.id),
				achievementCount: count(userAchievementsTable.achievementId),
			})
			.from(usersTable)
			.where(and(
				eq(usersTable.id, userId),
				isNull(usersTable.deletedAt)
			))
			.leftJoin(interviewSessionsTable, eq(interviewSessionsTable.userId, usersTable.id))
			.leftJoin(userAchievementsTable, eq(userAchievementsTable.userId, usersTable.id))
			.groupBy(usersTable.id);

		if (!result) {
			throw new TRPCError({code:"NOT_FOUND"});
		}

		return result;
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
		const achievements = await db
			.select({
				awardedAt: userAchievementsTable.awardedAt,
				id: achievementsTable.id,
				name: achievementsTable.name,
				description: achievementsTable.description,
				iconUrl: achievementsTable.iconUrl,
			})
			.from(userAchievementsTable)
			.innerJoin(
				achievementsTable,
				eq(userAchievementsTable.achievementId, achievementsTable.id)
			)
			.where(eq(userAchievementsTable.userId, ctx.session.user.id))
			.orderBy(desc(userAchievementsTable.awardedAt));

		return achievements;
	}),
});
