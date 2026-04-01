import {
	categoriesTable,
	reportStatusLogTable,
	reportsTable,
	scriptsTable,
} from "@diplom_work/db/schema/scheme";
import {
	type ReportStatus,
	reportStatuses,
} from "@diplom_work/domain/values/reportStatus";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, isNull } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@diplom_work/logger/server";
import {
	adminProcedure,
	expertProcedure,
	protectedProcedure,
	router,
} from "../init/routers";
import type { Context } from "../init/context";

const reportInputSchema = z.object({
	scriptId: z.uuid(),
	reason: z.string().trim().min(10).max(2000),
});

const listReportsSchema = z
	.object({
		categoryId: z.number().int().positive().optional(),
		scriptId: z.uuid().optional(),
		status: z.enum(reportStatuses).optional(),
		search: z.string().trim().min(1).optional(),
	})
	.optional();

const changeReportStatusSchema = z.object({
	reportId: z.uuid(),
	status: z.enum(reportStatuses),
});

type ReportWithRelations = {
	id: string;
	reason: string;
	createdAt: Date;
	reporter: {
		id: string;
		name: string;
		email: string;
	};
	scenario: {
		id: string;
		title: string;
		category: {
			id: number;
			name: string;
		} | null;
		expert: {
			id: string;
			name: string;
		};
	} | null;
	statusLogs: Array<{
		status: ReportStatus;
		createdAt: Date;
	}>;
};

function getCurrentStatus(report: ReportWithRelations) {
	return report.statusLogs[0]?.status ?? "new";
}

async function getRelevantScriptIds(
	db: Pick<Context["db"], "select" | "query">,
	{
	categoryId,
	scriptId,
	search,
	expertId,
}: {
	categoryId?: number;
	scriptId?: string;
	search?: string;
	expertId?: string;
}) {
	const whereClause = and(
		isNull(scriptsTable.deletedAt),
		eq(scriptsTable.isDraft, false),
		categoryId ? eq(scriptsTable.categoryId, categoryId) : undefined,
		scriptId ? eq(scriptsTable.id, scriptId) : undefined,
		expertId ? eq(scriptsTable.expertId, expertId) : undefined,
		search ? ilike(scriptsTable.title, `%${search}%`) : undefined,
	);

	const scripts = await db
		.select({ id: scriptsTable.id })
		.from(scriptsTable)
		.leftJoin(categoriesTable, eq(scriptsTable.categoryId, categoriesTable.id))
		.where(whereClause);

	return scripts.map((script) => script.id);
}

async function loadReports(db: Context["db"], scriptIds: string[]) {
	if (scriptIds.length === 0) {
		return [];
	}

	const reports = (await db.query.reportsTable.findMany({
		where: (reportsTable, { inArray }) =>
			inArray(reportsTable.scriptId, scriptIds),
		orderBy: (reportsTable, { desc }) => [desc(reportsTable.createdAt)],
		with: {
			reporter: {
				columns: {
					id: true,
					name: true,
					email: true,
				},
			},
			scenario: {
				columns: {
					id: true,
					title: true,
				},
				with: {
					category: {
						columns: {
							id: true,
							name: true,
						},
					},
					expert: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			},
			statusLogs: {
				columns: {
					status: true,
					createdAt: true,
				},
				orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
				limit: 1,
			},
		},
	})) as ReportWithRelations[];

	return reports.map((report) => ({
		id: report.id,
		reason: report.reason,
		createdAt: report.createdAt,
		status: getCurrentStatus(report),
		reporter: report.reporter,
		scenario: report.scenario,
		statusUpdatedAt: report.statusLogs[0]?.createdAt ?? report.createdAt,
	}));
}

export const reportRouter = router({
	create: protectedProcedure
		.input(reportInputSchema)
		.mutation(async ({ input, ctx }) => {
			const existingReport = await ctx.db.query.reportsTable.findFirst({
				where: (reportsTable, { and, eq }) =>
					and(
						eq(reportsTable.reporterId, ctx.session!.user.id),
						eq(reportsTable.scriptId, input.scriptId),
					),
				orderBy: (reportsTable, { desc }) => [desc(reportsTable.createdAt)],
				with: {
					statusLogs: {
						columns: {
							status: true,
							createdAt: true,
						},
						orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
						limit: 1,
					},
				},
			});

			const existingStatus = existingReport?.statusLogs[0]?.status;
			if (
				existingReport &&
				(existingStatus === "new" || existingStatus === "in_review")
			) {
				return { id: existingReport.id };
			}

			const script = await ctx.db.query.scriptsTable.findFirst({
				where: (scriptsTable, { and, eq, isNull }) =>
					and(
						eq(scriptsTable.id, input.scriptId),
						eq(scriptsTable.isDraft, false),
						isNull(scriptsTable.deletedAt),
					),
				columns: {
					id: true,
					expertId: true,
				},
			});

			if (!script) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Курс не найден",
				});
			}

			const now = new Date();
			const created = await ctx.db
				.insert(reportsTable)
				.values({
					reporterId: ctx.session!.user.id,
					scriptId: input.scriptId,
					reason: input.reason,
					createdAt: now,
				})
				.returning({ id: reportsTable.id });

			const reportId = created[0]?.id;

			if (!reportId) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Не удалось создать жалобу",
				});
			}

			await ctx.db.insert(reportStatusLogTable).values({
				reportId,
				status: "new",
				createdAt: now,
			});

			logger.info(
				{
					reportId,
					scriptId: input.scriptId,
					reporterId: ctx.session!.user.id,
				},
				"Created report",
			);

			return { id: reportId };
		}),
	myList: protectedProcedure.query(async ({ ctx }) => {
		const reports = (await ctx.db.query.reportsTable.findMany({
			where: (reportsTable, { eq }) =>
				eq(reportsTable.reporterId, ctx.session!.user.id),
			orderBy: (reportsTable, { desc }) => [desc(reportsTable.createdAt)],
			with: {
				reporter: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				scenario: {
					columns: {
						id: true,
						title: true,
					},
					with: {
						category: {
							columns: {
								id: true,
								name: true,
							},
						},
						expert: {
							columns: {
								id: true,
								name: true,
							},
						},
					},
				},
				statusLogs: {
					columns: {
						status: true,
						createdAt: true,
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
					limit: 1,
				},
			},
		})) as ReportWithRelations[];

		return reports.map((report) => ({
			id: report.id,
			reason: report.reason,
			createdAt: report.createdAt,
			status: getCurrentStatus(report),
			reporter: report.reporter,
			scenario: report.scenario,
			statusUpdatedAt: report.statusLogs[0]?.createdAt ?? report.createdAt,
		}));
	}),
	adminList: adminProcedure
		.input(listReportsSchema)
		.query(async ({ input, ctx }) => {
			const scriptIds = await getRelevantScriptIds(ctx.db, input ?? {});
			const reports = await loadReports(ctx.db, scriptIds);

			return input?.status
				? reports.filter((report) => report.status === input.status)
				: reports;
		}),
	expertList: expertProcedure
		.input(listReportsSchema)
		.query(async ({ input, ctx }) => {
			const scriptIds = await getRelevantScriptIds(ctx.db, {
				...input,
				expertId: ctx.session!.user.id,
			});
			const reports = await loadReports(ctx.db, scriptIds);

			return input?.status
				? reports.filter((report) => report.status === input.status)
				: reports;
		}),
	getById: protectedProcedure.input(z.uuid()).query(async ({ input, ctx }) => {
		const report = (await ctx.db.query.reportsTable.findFirst({
			where: (reportsTable, { eq }) => eq(reportsTable.id, input),
			with: {
				reporter: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				scenario: {
					columns: {
						id: true,
						title: true,
					},
					with: {
						category: {
							columns: {
								id: true,
								name: true,
							},
						},
						expert: {
							columns: {
								id: true,
								name: true,
							},
						},
					},
				},
				statusLogs: {
					columns: {
						status: true,
						createdAt: true,
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
				},
			},
		})) as ReportWithRelations | undefined;

		if (!report) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		const isAdmin = ctx.session?.session.role === "admin";
		const isOwner =
			report.reporter.id === ctx.session?.user.id ||
			report.scenario?.expert.id === ctx.session?.user.id;

		if (!isAdmin && !isOwner) {
			throw new TRPCError({ code: "FORBIDDEN" });
		}

		return {
			id: report.id,
			reason: report.reason,
			createdAt: report.createdAt,
			status: getCurrentStatus(report),
			reporter: report.reporter,
			scenario: report.scenario,
			statusUpdatedAt: report.statusLogs[0]?.createdAt ?? report.createdAt,
		};
	}),
	changeStatus: adminProcedure
		.input(changeReportStatusSchema)
		.mutation(async ({ input, ctx }) => {
			const report = await ctx.db.query.reportsTable.findFirst({
				where: (reportsTable, { eq }) => eq(reportsTable.id, input.reportId),
				columns: {
					id: true,
				},
			});

			if (!report) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await ctx.db.insert(reportStatusLogTable).values({
				reportId: input.reportId,
				status: input.status,
				createdAt: new Date(),
			});

			logger.info(
				{ reportId: input.reportId, status: input.status },
				"Updated report status",
			);

			return { id: input.reportId, status: input.status };
		}),
});
