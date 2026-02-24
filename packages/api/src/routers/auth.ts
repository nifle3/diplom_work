import { publicProcedure, router } from "../index";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
  }),
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
  }),
});
