import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


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
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  roleId: integer("role_id").notNull().references(() => rolesTable.id).default(1),
  xp: integer("xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  deletedAt: timestamp("deleted_at"),
});

export const accountsTable = pgTable("accounts", {
  id: uuid("id").primaryKey(),
  accountId: uuid("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
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
  userId: uuid("user_id").notNull().references(() => usersTable.id),
});

export const verificationsTable = pgTable("verifications", {
  id: uuid("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const categoriesTable = pgTable("categories", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const scriptsTable = pgTable("scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").notNull().references(() => categoriesTable.id),
  expertId: uuid("expert_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 150 }).notNull(),
  context: text("context").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const criteriaTypesTable = pgTable("criteria_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(), 
});

export const scenarioCriteriaTable = pgTable("scenario_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => scriptsTable.id),
  typeId: integer("type_id").notNull().references(() => criteriaTypesTable.id),
  content: text("content").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const questionTemplatesTable = pgTable("question_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => scriptsTable.id),
  text: text("text").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const specificCriteriaTable = pgTable("specific_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull().references(() => questionTemplatesTable.id),
  content: text("content").notNull(),
});

export const interviewSessionsTable = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  scriptId: uuid("script_id").notNull().references(() => scriptsTable.id),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  finalScore: integer("final_score"),
  expertFeedback: text("expert_feedback"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => interviewSessionsTable.id),
  isAi: boolean("is_ai").notNull(),
  messageText: text("message_text").notNull(),
  analysisNote: text("analysis_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievementsTable = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
});

export const userAchievementsTable = pgTable("user_achievements", {
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  achievementId: uuid("achievement_id").notNull().references(() => achievementsTable.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.achievementId] }),
}));

export const reportsTable = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id").notNull().references(() => usersTable.id),
  scriptId: uuid("script_id").notNull().references(() => scriptsTable.id),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const userRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, { fields: [usersTable.roleId], references: [rolesTable.id] }),
  sessions: many(interviewSessionsTable),
  scripts: many(scriptsTable),
  achievements: many(userAchievementsTable),
  reports: many(reportsTable),
}));

export const scenariosRelations = relations(scriptsTable, ({ one, many }) => ({
  category: one(categoriesTable, { fields: [scriptsTable.categoryId], references: [categoriesTable.id] }),
  expert: one(usersTable, { fields: [scriptsTable.expertId], references: [usersTable.id] }),
  globalCriteria: many(scenarioCriteriaTable),
  questions: many(questionTemplatesTable),
  sessions: many(interviewSessionsTable),
}));

export const scenarioCriteriaRelations = relations(scenarioCriteriaTable, ({ one }) => ({
  scenario: one(scriptsTable, { fields: [scenarioCriteriaTable.scenarioId], references: [scriptsTable.id] }),
  type: one(criteriaTypesTable, { fields: [scenarioCriteriaTable.typeId], references: [criteriaTypesTable.id] }),
}));

export const questionTemplatesRelations = relations(questionTemplatesTable, ({ one, many }) => ({
  scenario: one(scriptsTable, { fields: [questionTemplatesTable.scenarioId], references: [scriptsTable.id] }),
  specificCriteria: many(specificCriteriaTable),
}));

export const specificCriteriaRelations = relations(specificCriteriaTable, ({ one }) => ({
  question: one(questionTemplatesTable, { fields: [specificCriteriaTable.questionId], references: [questionTemplatesTable.id] }),
}));

export const interviewSessionsRelations = relations(interviewSessionsTable, ({ one, many }) => ({
  usersTable: one(usersTable, { fields: [interviewSessionsTable.userId], references: [usersTable.id] }),
  scenario: one(scriptsTable, { fields: [interviewSessionsTable.scriptId], references: [scriptsTable.id] }),
  messages: many(chatMessagesTable),
}));

export const chatMessagesRelations = relations(chatMessagesTable, ({ one }) => ({
  session: one(interviewSessionsTable, { fields: [chatMessagesTable.sessionId], references: [interviewSessionsTable.id] }),
}));

export const userAchievementsRelations = relations(userAchievementsTable, ({ one }) => ({
  usersTable: one(usersTable, { fields: [userAchievementsTable.userId], references: [usersTable.id] }),
  achievement: one(achievementsTable, { fields: [userAchievementsTable.achievementId], references: [achievementsTable.id] }),
}));

export const reportsRelations = relations(reportsTable, ({ one }) => ({
  reporter: one(usersTable, { fields: [reportsTable.reporterId], references: [usersTable.id] }),
  scenario: one(scriptsTable, { fields: [reportsTable.scriptId], references: [scriptsTable.id] }),
}));