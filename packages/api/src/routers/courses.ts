import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { getCourses, getCategories } from "@diplom_work/db";

const listCoursesSchema = z.object({
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
});
