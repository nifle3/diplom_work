import { Resend } from "resend";
import { env } from "@diplom_work/env/server";

export const client = new Resend(env.RESEND_API_KEY);