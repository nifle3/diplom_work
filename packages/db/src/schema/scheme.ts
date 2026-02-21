import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(), 
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  xp: integer("xp").default(0).notNull(),
  level: varchar("level", { length: 50 }).default("Стажер").notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  deletedAt: timestamp("deleted_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
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

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const scenarios = pgTable("scenarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  expertId: text("expert_id").notNull().references(() => user.id),
  title: varchar("title", { length: 150 }).notNull(),
  context: text("context").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const criteriaTypes = pgTable("criteria_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(), 
});

export const scenarioCriteria = pgTable("scenario_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => scenarios.id),
  typeId: integer("type_id").notNull().references(() => criteriaTypes.id),
  content: text("content").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const questionTemplates = pgTable("question_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => scenarios.id),
  text: text("text").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const specificCriteria = pgTable("specific_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull().references(() => questionTemplates.id),
  content: text("content").notNull(),
});

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id),
  scenarioId: uuid("scenario_id").notNull().references(() => scenarios.id),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  finalScore: integer("final_score"),
  expertFeedback: text("expert_feedback"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id),
  isAi: boolean("is_ai").notNull(),
  messageText: text("message_text").notNull(),
  analysisNote: text("analysis_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
});

export const userAchievements = pgTable("user_achievements", {
  userId: text("user_id").notNull().references(() => user.id),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.achievementId] }),
}));

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: text("reporter_id").notNull().references(() => user.id),
  scenarioId: uuid("scenario_id").notNull().references(() => scenarios.id),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const userRelations = relations(user, ({ one, many }) => ({
  role: one(roles, { fields: [user.roleId], references: [roles.id] }),
  sessions: many(interviewSessions),
  scenarios: many(scenarios),
  achievements: many(userAchievements),
  reports: many(reports),
}));

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  category: one(categories, { fields: [scenarios.categoryId], references: [categories.id] }),
  expert: one(user, { fields: [scenarios.expertId], references: [user.id] }),
  globalCriteria: many(scenarioCriteria),
  questions: many(questionTemplates),
  sessions: many(interviewSessions),
}));

export const scenarioCriteriaRelations = relations(scenarioCriteria, ({ one }) => ({
  scenario: one(scenarios, { fields: [scenarioCriteria.scenarioId], references: [scenarios.id] }),
  type: one(criteriaTypes, { fields: [scenarioCriteria.typeId], references: [criteriaTypes.id] }),
}));

export const questionTemplatesRelations = relations(questionTemplates, ({ one, many }) => ({
  scenario: one(scenarios, { fields: [questionTemplates.scenarioId], references: [scenarios.id] }),
  specificCriteria: many(specificCriteria),
}));

export const specificCriteriaRelations = relations(specificCriteria, ({ one }) => ({
  question: one(questionTemplates, { fields: [specificCriteria.questionId], references: [questionTemplates.id] }),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one, many }) => ({
  user: one(user, { fields: [interviewSessions.userId], references: [user.id] }),
  scenario: one(scenarios, { fields: [interviewSessions.scenarioId], references: [scenarios.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(interviewSessions, { fields: [chatMessages.sessionId], references: [interviewSessions.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(user, { fields: [userAchievements.userId], references: [user.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(user, { fields: [reports.reporterId], references: [user.id] }),
  scenario: one(scenarios, { fields: [reports.scenarioId], references: [scenarios.id] }),
}));