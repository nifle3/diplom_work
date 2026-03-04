import { z } from "zod";

export const evaluationSchema = z.object({
  overallScore: z.number().min(1).max(10),
  technicalScore: z.number().min(1).max(10),
  communicationScore: z.number().min(1).max(10),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  summary: z.string(),
});