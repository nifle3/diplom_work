import type { db } from "@diplom_work/db";
import {
	userAchievementsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { logger } from "@diplom_work/logger/server";
import { count, eq } from "drizzle-orm";
import {
	type AchievementFormulaContext,
	evaluateAchievementFormula,
} from "./formula";

type AchievementDbClient = Pick<typeof db, "query" | "select" | "insert">;

type SessionSnapshot = {
	startedAt: Date;
	finalScore: number | null;
	statusLogs: Array<{
		statusId: number;
		createdAt: Date;
	}>;
};

function getLatestStatusId(session: SessionSnapshot) {
	return session.statusLogs[0]?.statusId;
}

function getLatestStatusAt(session: SessionSnapshot) {
	return session.statusLogs[0]?.createdAt ?? session.startedAt;
}

function isCompletedSession(session: SessionSnapshot) {
	return getLatestStatusId(session) === statusToId.complete;
}

function isCanceledSession(session: SessionSnapshot) {
	return getLatestStatusId(session) === statusToId.canceled;
}

function getUtcDayKey(date: Date) {
	return date.toISOString().split("T")[0];
}

function getUtcDayStart(date: Date) {
	const normalized = new Date(date);
	normalized.setUTCHours(0, 0, 0, 0);
	return normalized;
}

function calculateDaysSince(date: Date, now: Date) {
	const currentDay = getUtcDayStart(now);
	const targetDay = getUtcDayStart(date);
	return Math.max(
		0,
		Math.floor(
			(currentDay.getTime() - targetDay.getTime()) / (24 * 60 * 60 * 1000),
		),
	);
}

export function calculateStreakFromSessions(sessions: SessionSnapshot[]) {
	const completedDays = Array.from(
		new Set(
			sessions
				.map((session) => {
					if (!isCompletedSession(session)) {
						return null;
					}

					return getUtcDayKey(getLatestStatusAt(session));
				})
				.filter((day): day is string => day !== null),
		),
	).sort((left, right) => right.localeCompare(left));

	if (completedDays.length === 0) {
		return 0;
	}

	const today = getUtcDayStart(new Date());
	const todayKey = getUtcDayKey(today);

	const yesterday = new Date(today);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);
	const yesterdayKey = getUtcDayKey(yesterday);

	if (completedDays[0] !== todayKey && completedDays[0] !== yesterdayKey) {
		return 0;
	}

	let streak = 0;
	let expectedDay = completedDays[0];

	for (const dayString of completedDays) {
		if (dayString !== expectedDay) {
			break;
		}

		streak++;
		const expectedDate = new Date(`${expectedDay}T00:00:00.000Z`);
		expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
		expectedDay = getUtcDayKey(expectedDate);
	}

	return streak;
}

async function getAchievementContext(
	client: AchievementDbClient,
	userId: string,
) {
	const [user, sessions, achievementCountResult] = await Promise.all([
		client.query.usersTable.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
			columns: {
				id: true,
				xp: true,
			},
		}),
		client.query.interviewSessionsTable.findMany({
			where: (sessions, { eq }) => eq(sessions.userId, userId),
			columns: {
				startedAt: true,
				finalScore: true,
			},
			with: {
				statusLogs: {
					columns: {
						statusId: true,
						createdAt: true,
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
					limit: 1,
				},
			},
			orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
		}),
		client
			.select({
				value: count(userAchievementsTable.achievementId),
			})
			.from(userAchievementsTable)
			.where(eq(userAchievementsTable.userId, userId)),
	]);

	if (!user) {
		return null;
	}

	const now = new Date();
	const completedSessions = sessions.filter(isCompletedSession);
	const canceledSessions = sessions.filter(isCanceledSession);
	const completedScores = completedSessions
		.map((session) => session.finalScore)
		.filter((score): score is number => score !== null);
	const latestSession = sessions[0];
	const latestCompletedSession = completedSessions[0];

	const interviewsToday = sessions.filter(
		(session) => getUtcDayKey(session.startedAt) === getUtcDayKey(now),
	).length;

	const completedToday = completedSessions.filter(
		(session) => getUtcDayKey(getLatestStatusAt(session)) === getUtcDayKey(now),
	).length;

	return {
		xp: user.xp,
		streak: calculateStreakFromSessions(sessions),
		interviewCount: sessions.length,
		completedInterviews: completedSessions.length,
		canceledInterviews: canceledSessions.length,
		averageScore:
			completedScores.length > 0
				? completedScores.reduce((sum, score) => sum + score, 0) /
					completedScores.length
				: 0,
		bestScore: completedScores.length > 0 ? Math.max(...completedScores) : 0,
		lastScore: latestCompletedSession?.finalScore ?? 0,
		achievementCount: achievementCountResult[0]?.value ?? 0,
		interviewsToday,
		completedToday,
		daysSinceLastInterview: latestSession
			? calculateDaysSince(latestSession.startedAt, now)
			: 0,
		daysSinceLastCompletedInterview: latestCompletedSession
			? calculateDaysSince(getLatestStatusAt(latestCompletedSession), now)
			: 0,
	} satisfies AchievementFormulaContext;
}

async function getExistingUserAchievementIds(
	client: AchievementDbClient,
	userId: string,
) {
	const existing = await client
		.select({
			achievementId: userAchievementsTable.achievementId,
		})
		.from(userAchievementsTable)
		.where(eq(userAchievementsTable.userId, userId));

	return new Set(existing.map((row) => row.achievementId));
}

async function getAwardableAchievements(client: AchievementDbClient) {
	return client.query.achievementsTable.findMany({
		orderBy: (achievements, { asc }) => [asc(achievements.createdAt)],
		columns: {
			id: true,
			name: true,
			formula: true,
		},
	});
}

export async function syncUserAchievements(
	client: AchievementDbClient,
	userId: string,
) {
	const achievements = await getAwardableAchievements(client);
	let awardedCount = 0;

	while (true) {
		const context = await getAchievementContext(client, userId);
		if (!context) {
			return awardedCount;
		}

		const existingIds = await getExistingUserAchievementIds(client, userId);
		const newAwards = [];

		for (const achievement of achievements) {
			if (existingIds.has(achievement.id)) {
				continue;
			}

			try {
				if (evaluateAchievementFormula(achievement.formula, context)) {
					newAwards.push({
						userId,
						achievementId: achievement.id,
					});
				}
			} catch (error) {
				logger.warn(
					{
						achievementId: achievement.id,
						achievementName: achievement.name,
						error,
					},
					"Skipping invalid achievement formula",
				);
			}
		}

		if (newAwards.length === 0) {
			return awardedCount;
		}

		await client.insert(userAchievementsTable).values(newAwards);
		awardedCount += newAwards.length;
	}
}

export async function syncAllUserAchievements(client: AchievementDbClient) {
	const users = await client.select({ id: usersTable.id }).from(usersTable);
	let awardedCount = 0;

	for (const user of users) {
		awardedCount += await syncUserAchievements(client, user.id);
	}

	return {
		userCount: users.length,
		awardedCount,
	};
}
