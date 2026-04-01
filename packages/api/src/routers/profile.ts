import { db } from "@diplom_work/db";
import {
	achievementsTable,
	interviewSessionsTable,
	userAchievementsTable,
} from "@diplom_work/db/schema/scheme";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { TRPCError } from "@trpc/server";
import { count, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../init/routers";

type SessionStatusLog = {
	statusId: number;
	createdAt: Date;
	status: {
		name: string;
	};
};

function isTerminalStatus(statusId: number | undefined) {
	return statusId === statusToId.complete || statusId === statusToId.canceled;
}

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

		const [user, interviewCountResult, achievementCountResult] =
			await Promise.all([
				db.query.usersTable.findFirst({
					where: (usersTable, { and, eq, isNull }) =>
						and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)),
					columns: {
						xp: true,
					},
				}),
				db
					.select({
						value: count(interviewSessionsTable.id),
					})
					.from(interviewSessionsTable)
					.where(eq(interviewSessionsTable.userId, userId)),
				db
					.select({
						value: count(userAchievementsTable.achievementId),
					})
					.from(userAchievementsTable)
					.where(eq(userAchievementsTable.userId, userId)),
			]);

		if (!user) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return {
			xp: user.xp,
			interviewCount: interviewCountResult[0]?.value ?? 0,
			achievementCount: achievementCountResult[0]?.value ?? 0,
		};
	}),
	getMyHistory: protectedProcedure.query(async ({ ctx }) => {
		const sessions = await db.query.interviewSessionsTable.findMany({
			where: (interviewSessionsTable, { eq }) =>
				eq(interviewSessionsTable.userId, ctx.session.user.id),
			columns: {
				id: true,
				finalScore: true,
				expertFeedback: true,
				startedAt: true,
			},
			with: {
				statusLogs: {
					columns: {
						statusId: true,
						createdAt: true,
					},
					with: {
						status: {
							columns: {
								name: true,
							},
						},
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
					limit: 1,
				},
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

		return sessions.map((session) => {
			const latestStatusLog = session.statusLogs[0] as
				| SessionStatusLog
				| undefined;
			const finishedAt = isTerminalStatus(latestStatusLog?.statusId)
				? (latestStatusLog?.createdAt ?? null)
				: null;

			return {
				id: session.id,
				finalScore: session.finalScore,
				expertFeedback: session.expertFeedback,
				startedAt: session.startedAt,
				finishedAt,
				script: session.script,
				status: latestStatusLog?.status ?? null,
			};
		});
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
				eq(userAchievementsTable.achievementId, achievementsTable.id),
			)
			.where(eq(userAchievementsTable.userId, ctx.session.user.id))
			.orderBy(desc(userAchievementsTable.awardedAt));

		return achievements;
	}),
});
