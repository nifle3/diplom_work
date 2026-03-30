import { db } from "@diplom_work/db";
import {
	categoriesTable,
	criteriaTypesTable,
	scriptsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { getPersistentLink } from "@diplom_work/file";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { z } from "zod";
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

export const getLatestScenariosSchema = z.object({
	limit: z.number().int().min(1).max(20).default(5),
});

export const listScenariosSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(50).default(12),
	categoryId: z.number().optional(),
	search: z.string().optional(),
});

export const getExpertProfileSchema = z.object({
	expertId: z.uuid(),
	categoryId: z.number().int().positive().optional(),
});

export const scriptRouter = router({
	getInfo: protectedProcedure.input(z.uuid()).query(async ({ input }) => {
		const script = await db.query.scriptsTable.findFirst({
			where: (scriptsTable, { eq, and, isNull }) =>
				and(
					eq(scriptsTable.id, input),
					eq(scriptsTable.isDraft, false),
					isNull(scriptsTable.deletedAt),
				),
			columns: {
				id: true,
				title: true,
				description: true,
				draftOverAt: true,
				image: true,
			},
			with: {
				expert: true,
				category: true,
			},
		});

		if (!script) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return script;
	}),
	getLatest: protectedProcedure
		.input(getLatestScenariosSchema)
		.query(async ({ input }) => {
			const dbResult = await db
				.select({
					id: scriptsTable.id,
					title: scriptsTable.title,
					description: scriptsTable.description,
					image: scriptsTable.image,
					categoryName: categoriesTable.name,
					expertId: usersTable.id,
					expertName: usersTable.name,
				})
				.from(scriptsTable)
				.innerJoin(
					categoriesTable,
					eq(scriptsTable.categoryId, categoriesTable.id),
				)
				.innerJoin(usersTable, eq(scriptsTable.expertId, usersTable.id))
				.where(
					and(eq(scriptsTable.isDraft, false), isNull(scriptsTable.deletedAt)),
				)
				.orderBy(desc(scriptsTable.createdAt))
				.limit(input.limit);

			const result = Promise.all(
				dbResult.map(async (item) => {
					if (!item.image) {
						return item;
					}

					const link = await getPersistentLink(item.image);
					item.image = link;
					return item;
				}),
			);
			return result;
		}),

	categories: protectedProcedure.query(async () => {
		const categories = await db
			.select({ id: categoriesTable.id, name: categoriesTable.name })
			.from(categoriesTable);

		return categories;
	}),

	list: protectedProcedure
		.input(listScenariosSchema)
		.query(async ({ input }) => {
			const { page, limit, categoryId, search } = input;
			const offset = (page - 1) * limit;

			const whereClause = and(
				isNull(scriptsTable.deletedAt),
				eq(scriptsTable.isDraft, false),
				categoryId ? eq(scriptsTable.categoryId, categoryId) : undefined,
				search ? ilike(scriptsTable.title, `%${search}%`) : undefined,
			);

			const totalResult = await db
				.select({ count: count() })
				.from(scriptsTable)
				.where(whereClause);

			const total = totalResult[0]?.count ?? 0;
			const pages = Math.ceil(total / limit);

			const courses = await db
				.select({
					id: scriptsTable.id,
					title: scriptsTable.title,
					description: scriptsTable.description,
					image: scriptsTable.image,
					categoryName: categoriesTable.name,
					expertId: usersTable.id,
					expertName: usersTable.name,
				})
				.from(scriptsTable)
				.innerJoin(
					categoriesTable,
					eq(scriptsTable.categoryId, categoriesTable.id),
				)
				.innerJoin(usersTable, eq(scriptsTable.expertId, usersTable.id))
				.where(whereClause)
				.orderBy(desc(scriptsTable.createdAt))
				.limit(limit)
				.offset(offset);

			return {
				courses,
				total,
				page,
				pages,
			};
		}),

	getExpertProfile: protectedProcedure
		.input(getExpertProfileSchema)
		.query(async ({ input }) => {
			const expert = await db.query.usersTable.findFirst({
				where: (usersTable, { and, eq, isNull }) =>
					and(
						eq(usersTable.id, input.expertId),
						eq(usersTable.roleId, 2),
						isNull(usersTable.deletedAt),
					),
				columns: {
					id: true,
					name: true,
					image: true,
				},
			});

			if (!expert) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const categories = await db
				.select({
					id: categoriesTable.id,
					name: categoriesTable.name,
					count: sql<number>`count(${scriptsTable.id})`,
				})
				.from(scriptsTable)
				.innerJoin(
					categoriesTable,
					eq(scriptsTable.categoryId, categoriesTable.id),
				)
				.where(
					and(
						eq(scriptsTable.expertId, input.expertId),
						eq(scriptsTable.isDraft, false),
						isNull(scriptsTable.deletedAt),
					),
				)
				.groupBy(categoriesTable.id, categoriesTable.name)
				.orderBy(categoriesTable.name);

			const courses = await db
				.select({
					id: scriptsTable.id,
					title: scriptsTable.title,
					description: scriptsTable.description,
					image: scriptsTable.image,
					categoryId: categoriesTable.id,
					categoryName: categoriesTable.name,
					expertId: usersTable.id,
					expertName: usersTable.name,
				})
				.from(scriptsTable)
				.innerJoin(
					categoriesTable,
					eq(scriptsTable.categoryId, categoriesTable.id),
				)
				.innerJoin(usersTable, eq(scriptsTable.expertId, usersTable.id))
				.where(
					and(
						eq(scriptsTable.expertId, input.expertId),
						eq(scriptsTable.isDraft, false),
						isNull(scriptsTable.deletedAt),
						input.categoryId
							? eq(scriptsTable.categoryId, input.categoryId)
							: undefined,
					),
				)
				.orderBy(desc(scriptsTable.createdAt));

			return {
				expert,
				categories,
				courses,
			};
		}),

	criteriaTypes: protectedProcedure.query(async () => {
		const criteriaTypes = await db
			.select({ id: criteriaTypesTable.id, name: criteriaTypesTable.name })
			.from(criteriaTypesTable);

		return criteriaTypes;
	}),
	getUserHistory: protectedProcedure.query(async ({ ctx }) => {
		const sessions = await db.query.interviewSessionsTable.findMany({
			where: (interviewSessionsTable, { eq }) =>
				eq(interviewSessionsTable.userId, ctx.session.user.id),
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
				script: true,
			},
		});

		return sessions.map((session) => {
			const latestStatusLog = session.statusLogs[0] as
				| SessionStatusLog
				| undefined;

			return {
				...session,
				finishedAt: isTerminalStatus(latestStatusLog?.statusId)
					? (latestStatusLog?.createdAt ?? null)
					: null,
				status: latestStatusLog?.status ?? null,
			};
		});
	}),
	getUserHistoryByScript: protectedProcedure
		.input(z.uuid())
		.query(async ({ input, ctx }) => {
			const sessions = await db.query.interviewSessionsTable.findMany({
				where: (interviewSessionsTable, { eq, and }) =>
					and(
						eq(interviewSessionsTable.userId, ctx.session.user.id),
						eq(interviewSessionsTable.scriptId, input),
					),
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
					script: true,
				},
			});

			return sessions.map((session) => {
				const latestStatusLog = session.statusLogs[0] as
					| SessionStatusLog
					| undefined;

				return {
					...session,
					finishedAt: isTerminalStatus(latestStatusLog?.statusId)
						? (latestStatusLog?.createdAt ?? null)
						: null,
					status: latestStatusLog?.status ?? null,
				};
			});
		}),
});
