import { env } from "@diplom_work/env/server";
import { Resend } from "resend";

export const client = new Resend(env.RESEND_API_KEY);
