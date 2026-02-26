import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm"; 

import { scriptsTable, scriptCriteriaTable } from "@diplom_work/db/schema/scheme";
import { db } from "@diplom_work/db";

import { protectedProcedure, router } from "..";

export const firstStepScheme = z.object({
    scriptId: z.uuid(),
    title: z.string()
        .min(5, "Название должно быть больше 5 символов")
        .max(50, "Название должно быть меньше 50 символов"),
    descripton: z.string()
        .max(500, "Описание может содержать только 500 символов")
        .nullable(),
    categoryId: z.number().positive()
});

export type FirstStepScheme = z.infer<typeof firstStepScheme>;

const criteriaSchema = z.object({
    id: z.uuid().nullable(),
    typeId: z.number().int().positive(),
    content: z.string().min(1, 'Содержание критерия обязательно'),
});

export const secondStepScheme = z.object({
    scriptId: z.uuid(),
    context: z.string().max(1000, "Максимальное количество символо 1000"),
    criteria: z.array(criteriaSchema).min(1, "Добавьте хотя бы один кртерий"),
    deletedCriteria: z.array(z.uuid()).nullable()
});

export type SecondStepScheme = z.infer<typeof secondStepScheme>;

export const questionTemplateScheme = z.object({
    id: z.uuid()
});

export const thirdStepScheme = z.object({
    scriptId: z.uuid(),
});

export type ThirdStepScheme = z.infer<typeof thirdStepScheme>;

export const mutateScriptRouter = router({
    mutateFirstStep: protectedProcedure
        .input(firstStepScheme)
        .mutation(async ({ctx, input}) => {
            await db.update(scriptsTable).set({
                title: input.title,
                description: input.descripton,
                categoryId: input.categoryId,
            }).where(and(
                eq(scriptsTable.expertId, ctx.session.user.id),
                eq(scriptsTable.id, input.scriptId),
                isNull(scriptsTable.deletedAt)
            ))
        }),
    mutateSecondStep: protectedProcedure
        .input(secondStepScheme)
        .mutation(async ({ctx, input}) => {
            const script = await db.query.scriptsTable.findFirst({
                where: (scriptsTable, {eq, and, isNull}) => and(
                    eq(scriptsTable.id, input.scriptId),
                    isNull(scriptsTable.deletedAt)
                ) 
            })

            if (!script) {
                throw new TRPCError({code:"NOT_FOUND"});
            }

            if (script.expertId != ctx.session.user.id) {
                throw new TRPCError({code: "FORBIDDEN"});
            }
            
            //TODO: add transaction
            await db.update(scriptsTable).set({
                context: input.context,
            }).where(and(
                eq(scriptsTable.expertId, ctx.session.user.id),
                eq(scriptsTable.id, input.scriptId),
                isNull(scriptsTable.deletedAt)
            ))

            input.criteria.filter((val) => val.id).forEach(async (val) => {
                await db.update(scriptCriteriaTable).set({
                    content: val.content,
                    typeId: val.typeId,
                }).where(eq(scriptCriteriaTable.id, val.id!));
            })

            input.criteria.filter((val) => !val.id).forEach(async (val) => {
                await db.insert(scriptCriteriaTable).values({
                    scriptId: input.scriptId,
                    typeId: val.typeId,
                    content: val.content,
                })
            })

            input.deletedCriteria?.forEach(async (val) => {
                //TODO: delete
                await db.update(scriptCriteriaTable).set({
                    
                }).where(eq(scriptCriteriaTable.id, val))
            })
        }),
    mutateThirdStep: protectedProcedure
        .input(thirdStepScheme)
        .mutation(async ({ctx, input}) => {

        })
});