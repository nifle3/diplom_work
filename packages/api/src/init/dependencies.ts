import { auth } from "@diplom_work/auth";
import { db } from "@diplom_work/db";
import { getPersistentLink, getPersistentUploadLink } from "@diplom_work/file";
import { evaluateAnswer, planInterviewStep, summarize } from "@diplom_work/llm";

export type AppDependencies = {
	auth: typeof auth;
	db: typeof db;
	file: {
		getPersistentLink: typeof getPersistentLink;
		getPersistentUploadLink: typeof getPersistentUploadLink;
	};
	llm: {
		evaluateAnswer: typeof evaluateAnswer;
		planInterviewStep: typeof planInterviewStep;
		summarize: typeof summarize;
	};
};

export const defaultDependencies: AppDependencies = {
	auth,
	db,
	file: {
		getPersistentLink,
		getPersistentUploadLink,
	},
	llm: {
		evaluateAnswer,
		planInterviewStep,
		summarize,
	},
};
