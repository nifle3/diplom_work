import { db } from "@diplom_work/db";
import {
	questionTemplatesTable,
	scriptCriteriaTable,
	scriptsTable,
	specificCriteriaTable,
} from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "..";

export const firstStepScheme = z.object({
	scriptId: z.uuid(),
	title: z
		.string()
		.min(5, "Название должно быть больше 5 символов")
		.max(50, "Название должно быть меньше 50 символов"),
	description: z
		.string()
		.max(500, "Описание может содержать только 500 символов")
		.nullable(),
	categoryId: z.number().positive(),
});

export type FirstStepScheme = z.infer<typeof firstStepScheme>;

const criteriaSchema = z.object({
	id: z.uuid().nullable(),
	typeId: z.number().int().positive(),
	content: z.string().min(1, "Содержание критерия обязательно"),
});

export const secondStepScheme = z.object({
	scriptId: z.uuid(),
	context: z.string().max(1000, "Максимальное количество символо 1000"),
	criteria: z.array(criteriaSchema).min(1, "Добавьте хотя бы один кртерий"),
	deletedCriteria: z.array(z.uuid()).nullable(),
});

export type SecondStepScheme = z.infer<typeof secondStepScheme>;

const specificCriteriaSchema = z.object({
	id: z.uuid().nullable(),
	content: z.string().min(1, "Содержание критерия обязательно"),
});

const questionTemplateSchema = z.object({
	id: z.uuid().nullable(),
	text: z.string().min(1, "Текст вопроса обязателен"),
	specificCriteria: z.array(specificCriteriaSchema),
});

export const thirdStepScheme = z.object({
	scriptId: z.uuid(),
	questions: z.array(questionTemplateSchema),
	deletedQuestions: z.array(z.uuid()).nullable(),
});

export type ThirdStepScheme = z.infer<typeof thirdStepScheme>;

export const mutateScriptRouter = router({
	postDraft: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq, isNull, and }) =>
					and(eq(scriptsTable.id, input), isNull(scriptsTable.deletedAt)),
			});
			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (script.expertId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			if (
				!script.context ||
				!script.categoryId ||
				!script.title ||
				!script.isDraft
			) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Сценарий должен быть заполненным",
				});
			}

			await db
				.update(scriptsTable)
				.set({
					isDraft: false,
					updatedAt: new Date(),
					draftOverAt: new Date(),
				})
				.where(
					and(
						eq(scriptsTable.id, input),
						isNull(scriptsTable.deletedAt),
						eq(scriptsTable.isDraft, true),
					),
				);
		}),
	deleteScript: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq, and, isNull }) =>
					and(eq(scriptsTable.id, input), isNull(scriptsTable.deletedAt)),
			});
			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (script.expertId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			await db
				.update(scriptsTable)
				.set({
					deletedAt: new Date(),
				})
				.where(and(eq(scriptsTable.id, input), isNull(scriptsTable.deletedAt)));
		}),
	mutateFirstStep: protectedProcedure
		.input(firstStepScheme)
		.mutation(async ({ ctx, input }) => {
			await db
				.update(scriptsTable)
				.set({
					title: input.title,
					description: input.description,
					categoryId: input.categoryId,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(scriptsTable.expertId, ctx.session.user.id),
						eq(scriptsTable.id, input.scriptId),
						isNull(scriptsTable.deletedAt),
					),
				);
		}),
	mutateSecondStep: protectedProcedure
		.input(secondStepScheme)
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq, and, isNull }) =>
					and(
						eq(scriptsTable.id, input.scriptId),
						isNull(scriptsTable.deletedAt),
					),
			});

			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (script.expertId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			await db.transaction(async (tx) => {
				await tx
					.update(scriptsTable)
					.set({
						context: input.context,
					})
					.where(
						and(
							eq(scriptsTable.expertId, ctx.session.user.id),
							eq(scriptsTable.id, input.scriptId),
							isNull(scriptsTable.deletedAt),
						),
					);

				input.criteria
					.filter((val) => val.id)
					.forEach(async (val) => {
						await tx
							.update(scriptCriteriaTable)
							.set({
								content: val.content,
								typeId: val.typeId,
							})
							.where(eq(scriptCriteriaTable.id, val.id!));
					});

				input.criteria
					.filter((val) => !val.id)
					.forEach(async (val) => {
						await tx.insert(scriptCriteriaTable).values({
							scriptId: input.scriptId,
							typeId: val.typeId,
							content: val.content,
						});
					});

				input.deletedCriteria?.forEach(async (val) => {
					await tx
						.update(scriptCriteriaTable)
						.set({
							deletedAt: new Date(),
						})
						.where(eq(scriptCriteriaTable.id, val));
				});
			});
		}),
	mutateThirdStep: protectedProcedure
		.input(thirdStepScheme)
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq, and, isNull }) =>
					and(
						eq(scriptsTable.id, input.scriptId),
						isNull(scriptsTable.deletedAt),
					),
			});

			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (script.expertId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			await db.transaction(async (tx) => {
				for (const question of input.questions) {
					let questionId: string;

					if (question.id) {
						await tx
							.update(questionTemplatesTable)
							.set({
								text: question.text,
							})
							.where(eq(questionTemplatesTable.id, question.id));
						questionId = question.id;
					} else {
						const [newQuestion] = await tx
							.insert(questionTemplatesTable)
							.values({
								scriptId: input.scriptId,
								text: question.text,
							})
							.returning();
						if (!newQuestion) {
							throw new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Ошибка при создании вопроса",
							});
						}
						questionId = newQuestion.id;
					}

					const existingCriteria = await tx
						.select()
						.from(specificCriteriaTable)
						.where(eq(specificCriteriaTable.questionId, questionId));

					const existingIds = new Set(existingCriteria.map((c) => c.id));
					const inputIds = new Set(
						question.specificCriteria.filter((c) => c.id).map((c) => c.id),
					);

					const toDelete = [...existingIds].filter((id) => !inputIds.has(id));
					for (const id of toDelete) {
						await tx
							.delete(specificCriteriaTable)
							.where(eq(specificCriteriaTable.id, id));
					}

					for (const criterion of question.specificCriteria) {
						if (criterion.id) {
							await tx
								.update(specificCriteriaTable)
								.set({
									content: criterion.content,
								})
								.where(eq(specificCriteriaTable.id, criterion.id));
						} else {
							await tx.insert(specificCriteriaTable).values({
								questionId,
								content: criterion.content,
							});
						}
					}
				}

				if (input.deletedQuestions) {
					for (const questionId of input.deletedQuestions) {
						await tx
							.update(questionTemplatesTable)
							.set({
								deletedAt: new Date(),
							})
							.where(eq(questionTemplatesTable.id, questionId));
					}
				}

				await tx
					.update(scriptsTable)
					.set({
						isDraft: false,
					})
					.where(eq(scriptsTable.id, input.scriptId));
			});
		}),
});
