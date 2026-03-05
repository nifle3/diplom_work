// МБ СТОИТ ДОБАВИТЬ КОЛИЧЕСТВО ВОПРОСОВ ЗАРАНЕЕ.

import { z } from "zod";

const nextQuestionInput = z.object({
    context: z.string(),
    qustionExapmles: z.array(z.string()),
    previoisSummarization: z.string(),
});

const nextQuestionOutput = z.object({

});

type NextQuestionInput = z.infer<typeof nextQuestionInput>;
type NextQuestionOutput = z.infer<typeof nextQuestionOutput>;


interface ModuleInterface {
    startConversation: () => void;
    getSummarization: () => void;
    getNextQuestion: (input: NextQuestionInput) => NextQuestionOutput;
    evaluateAnswer: () => void;
}