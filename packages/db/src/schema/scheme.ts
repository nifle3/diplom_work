import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const rolesTable = pgTable("roles", {
	id: integer("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
});

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: "date" }).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
	roleId: integer("role_id")
		.notNull()
		.references(() => rolesTable.id)
		.default(1),
	xp: integer("xp").default(0).notNull(),
	deletedAt: timestamp("deleted_at", { mode: "date" }),
	activeInterviewSessionId: uuid("active_interview_session_id"),
});

export const accountsTable = pgTable("accounts", {
	id: uuid("id").primaryKey(),
	accountId: uuid("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => usersTable.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
	id: uuid("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id")
		.notNull()
		.references(() => usersTable.id),
});

export const verificationsTable = pgTable("verifications", {
	id: uuid("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }),
	updatedAt: timestamp("updated_at", { mode: "date" }),
});

export const categoriesTable = pgTable("categories", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: varchar("name", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }),
	deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const scriptsTable = pgTable("scripts", {
	id: uuid("id").primaryKey().defaultRandom(),
	categoryId: integer("category_id").references(() => categoriesTable.id),
	expertId: uuid("expert_id")
		.notNull()
		.references(() => usersTable.id),
	title: varchar("title", { length: 150 }).notNull().default(""),
	image: text("image"),
	context: text("context"),
	isDraft: boolean().default(true),
	description: text().notNull().default(""),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	draftOverAt: timestamp("draft_over_at", { mode: "date" }),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const criteriaTypesTable = pgTable("criteria_types", {
	id: integer("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull(),
});

export const scriptCriteriaTable = pgTable("scenario_criteria", {
	id: uuid("id").primaryKey().defaultRandom(),
	scriptId: uuid("scenario_id")
		.notNull()
		.references(() => scriptsTable.id),
	typeId: integer("type_id")
		.notNull()
		.references(() => criteriaTypesTable.id),
	content: text("content").notNull(),
	deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const questionTemplatesTable = pgTable("question_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	scriptId: uuid("scenario_id")
		.notNull()
		.references(() => scriptsTable.id),
	order: integer("order").default(0).notNull(),
	text: text("text").notNull(),
	deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const specificCriteriaTable = pgTable("specific_criteria", {
	id: uuid("id").primaryKey().defaultRandom(),
	questionId: uuid("question_id")
		.notNull()
		.references(() => questionTemplatesTable.id),
	content: text("content").notNull(),
});

export const interviewSessionsTable = pgTable("interview_sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => usersTable.id),
	scriptId: uuid("script_id")
		.notNull()
		.references(() => scriptsTable.id),
	finalScore: integer("final_score"),
	expertFeedback: text("expert_feedback"),
	currentQuestionIndex: integer("current_question_index").default(0).notNull(),
	startedAt: timestamp("started_at").defaultNow().notNull(),
	summarize: text("summarize"),
});

export const interviewSessionStatusesTable = pgTable(
	"interview_session_statuses",
	{
		id: integer().primaryKey(),
		name: varchar("status", { length: 20 }).notNull(),
	},
);

export const interviewSessionStatusLogTable = pgTable(
	"interview_session_status_log",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		sessionId: uuid("session_id")
			.notNull()
			.references(() => interviewSessionsTable.id),
		statusId: integer("status_id")
			.notNull()
			.references(() => interviewSessionStatusesTable.id),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	},
);

export const chatMessagesTable = pgTable("chat_messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id")
		.notNull()
		.references(() => interviewSessionsTable.id),
	isAi: boolean("is_ai").notNull(),
	messageText: text("message_text").notNull(),
	analysisNote: text("analysis_note"),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const achievementsTable = pgTable("achievements", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description").notNull(),
	iconUrl: text("icon_url"),
	formula: text("formula").notNull().default("false"),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userAchievementsTable = pgTable(
	"user_achievements",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => usersTable.id),
		achievementId: uuid("achievement_id")
			.notNull()
			.references(() => achievementsTable.id),
		awardedAt: timestamp("awarded_at", { mode: "date" }).defaultNow().notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.achievementId] }),
	}),
);

export const reportsTable = pgTable("reports", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: uuid("reporter_id")
		.notNull()
		.references(() => usersTable.id),
	scriptId: uuid("script_id")
		.notNull()
		.references(() => scriptsTable.id),
	reason: text("reason").notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const reportStatusLogTable = pgTable("report_status_log", {
	id: uuid("id").primaryKey().defaultRandom(),
	reportId: uuid("report_id")
		.notNull()
		.references(() => reportsTable.id),
	status: varchar("status", { length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const userRelations = relations(usersTable, ({ one, many }) => ({
	role: one(rolesTable, {
		fields: [usersTable.roleId],
		references: [rolesTable.id],
	}),
	sessions: many(interviewSessionsTable),
	scripts: many(scriptsTable),
	achievements: many(userAchievementsTable),
	reports: many(reportsTable),
}));

export const scriptsRelations = relations(scriptsTable, ({ one, many }) => ({
	category: one(categoriesTable, {
		fields: [scriptsTable.categoryId],
		references: [categoriesTable.id],
	}),
	expert: one(usersTable, {
		fields: [scriptsTable.expertId],
		references: [usersTable.id],
	}),
	globalCriteria: many(scriptCriteriaTable),
	questions: many(questionTemplatesTable),
	sessions: many(interviewSessionsTable),
}));

export const scenarioCriteriaRelations = relations(
	scriptCriteriaTable,
	({ one }) => ({
		scenario: one(scriptsTable, {
			fields: [scriptCriteriaTable.scriptId],
			references: [scriptsTable.id],
		}),
		type: one(criteriaTypesTable, {
			fields: [scriptCriteriaTable.typeId],
			references: [criteriaTypesTable.id],
		}),
	}),
);

export const questionTemplatesRelations = relations(
	questionTemplatesTable,
	({ one, many }) => ({
		scenario: one(scriptsTable, {
			fields: [questionTemplatesTable.scriptId],
			references: [scriptsTable.id],
		}),
		specificCriteria: many(specificCriteriaTable),
	}),
);

export const specificCriteriaRelations = relations(
	specificCriteriaTable,
	({ one }) => ({
		question: one(questionTemplatesTable, {
			fields: [specificCriteriaTable.questionId],
			references: [questionTemplatesTable.id],
		}),
	}),
);

export const interviewSessionsRelations = relations(
	interviewSessionsTable,
	({ one, many }) => ({
		usersTable: one(usersTable, {
			fields: [interviewSessionsTable.userId],
			references: [usersTable.id],
		}),
		script: one(scriptsTable, {
			fields: [interviewSessionsTable.scriptId],
			references: [scriptsTable.id],
		}),
		messages: many(chatMessagesTable),
		statusLogs: many(interviewSessionStatusLogTable),
	}),
);

export const interviewSessionStatusLogRelations = relations(
	interviewSessionStatusLogTable,
	({ one }) => ({
		session: one(interviewSessionsTable, {
			fields: [interviewSessionStatusLogTable.sessionId],
			references: [interviewSessionsTable.id],
		}),
		status: one(interviewSessionStatusesTable, {
			fields: [interviewSessionStatusLogTable.statusId],
			references: [interviewSessionStatusesTable.id],
		}),
	}),
);

export const chatMessagesRelations = relations(
	chatMessagesTable,
	({ one }) => ({
		session: one(interviewSessionsTable, {
			fields: [chatMessagesTable.sessionId],
			references: [interviewSessionsTable.id],
		}),
	}),
);

export const userAchievementsRelations = relations(
	userAchievementsTable,
	({ one }) => ({
		usersTable: one(usersTable, {
			fields: [userAchievementsTable.userId],
			references: [usersTable.id],
		}),
		achievement: one(achievementsTable, {
			fields: [userAchievementsTable.achievementId],
			references: [achievementsTable.id],
		}),
	}),
);

export const reportsRelations = relations(reportsTable, ({ one, many }) => ({
	reporter: one(usersTable, {
		fields: [reportsTable.reporterId],
		references: [usersTable.id],
	}),
	scenario: one(scriptsTable, {
		fields: [reportsTable.scriptId],
		references: [scriptsTable.id],
	}),
	statusLogs: many(reportStatusLogTable),
}));

export const reportStatusLogRelations = relations(
	reportStatusLogTable,
	({ one }) => ({
		report: one(reportsTable, {
			fields: [reportStatusLogTable.reportId],
			references: [reportsTable.id],
		}),
	}),
);
