import { model } from "../model/model";
import { evaluationSchema } from "./evaluation.schema";

export async function evaluateInterview(input: {
  criteria: string;
  transcript: string;
}) {
  const structuredModel = model.withStructuredOutput(evaluationSchema);

  const result = await structuredModel.invoke(`
Ты эксперт по технической оценке кандидатов.

Критерии оценки:
${input.criteria}

Интервью:
${input.transcript}

Проанализируй кандидата.
`);

  return result;
}