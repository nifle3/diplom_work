import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { getCourses, getCategories, createCourse, createCourseWithDetails, getCriteriaTypes } from "@diplom_work/db";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  context: z.string().min(10).max(1000),
  categoryId: z.string().uuid(),
});

export const createCourseWithDetailsSchema = createCourseSchema.extend({
  questions: z.array(z.string().min(1)).optional(),
  criteria: z.array(z.object({ typeId: z.number().int().optional(), content: z.string().min(1) })).optional(),
});

export const listCoursesSchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(12),
});

export const coursesRouter = router({
  list: protectedProcedure
    .input(listCoursesSchema)
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const { courses, total } = await getCourses({
        categoryId: input.categoryId,
        search: input.search,
        limit: input.limit,
        offset,
      });

      const pages = Math.ceil(total / input.limit);

      return {
        courses,
        total,
        page: input.page,
        limit: input.limit,
        pages,
      };
    }),

  categories: publicProcedure.query(async () => {
    return await getCategories();
  }),

  create: protectedProcedure
    .input(createCourseSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.user.id должен быть id эксперта
      if (!ctx.user || ctx.user.role !== "expert") {
        throw new Error("Доступ только для экспертов");
      }
      return await createCourse({
        ...input,
        expertId: ctx.user.id,
      });
    }),
  createWithDetails: protectedProcedure
    .input(createCourseWithDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "expert") {
        throw new Error("Доступ только для экспертов");
      }
      return await createCourseWithDetails({
        ...input,
        expertId: ctx.user.id,
      });
    }),
  criteriaTypes: publicProcedure.query(async () => {
    return await getCriteriaTypes();
  }),
});
