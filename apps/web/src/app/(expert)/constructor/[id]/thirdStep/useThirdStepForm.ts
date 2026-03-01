"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/lib/trpc";

const specificCriteriaSchema = z.object({
	id: z.uuid().nullable(),
	content: z.string().min(1, "Содержание критерия обязательно"),
});

const questionTemplateSchema = z.object({
	id: z.uuid().nullable(),
	text: z.string().min(1, "Текст вопроса обязателен"),
	specificCriteria: z.array(specificCriteriaSchema),
});

export const thirdStepFormSchema = z.object({
	questions: z.array(questionTemplateSchema),
	deletedQuestions: z.array(z.uuid()).nullable(),
});

export type ThirdStepFormValues = z.infer<typeof thirdStepFormSchema>;

interface UseThirdStepFormOptions {
	initialData: {
		id: string;
		questions: Array<{
			id: string;
			text: string;
			specificCriteria: Array<{
				id: string;
				content: string;
			}>;
		}>;
	};
}

export function useThirdStepForm({ initialData }: UseThirdStepFormOptions) {
	const router = useRouter();

	const mutation = useMutation(
		trpc.createScript.mutateThirdStep.mutationOptions({
			onSuccess: () => {
				toast.success("Скрипт успешно создан");
				router.replace("/expert");
			},
			onError: (error: unknown) => {
				const message =
					error instanceof Error ? error.message : "Ошибка при сохранении";
				toast.error(message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			questions: initialData.questions.map((q) => ({
				id: q.id,
				text: q.text,
				specificCriteria: q.specificCriteria.map((c) => ({
					id: c.id,
					content: c.content,
				})),
			})),
			deletedQuestions:
				[] as unknown as ThirdStepFormValues["deletedQuestions"],
		} as ThirdStepFormValues,
		validators: {
			onSubmit: thirdStepFormSchema as never,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({
				scriptId: initialData.id,
				questions: value.questions,
				deletedQuestions: value.deletedQuestions,
			});
		},
	});

	const addQuestion = () => {
		form.setFieldValue("questions", [
			...form.getFieldValue("questions"),
			{ id: null, text: "", specificCriteria: [] },
		]);
	};

	const removeQuestion = (index: number) => {
		const questions = form.getFieldValue("questions");
		const removed = questions[index];
		if (removed.id) {
			const currentDeleted = form.getFieldValue("deletedQuestions") ?? [];
			form.setFieldValue("deletedQuestions", [...currentDeleted, removed.id]);
		}
		form.setFieldValue(
			"questions",
			questions.filter((_: unknown, i: number) => i !== index),
		);
	};

	const addSpecificCriterion = (questionIndex: number) => {
		const questions = [...form.getFieldValue("questions")];
		questions[questionIndex] = {
			...questions[questionIndex],
			specificCriteria: [
				...questions[questionIndex].specificCriteria,
				{ id: null, content: "" },
			],
		};
		form.setFieldValue("questions", questions);
	};

	const removeSpecificCriterion = (
		questionIndex: number,
		criteriaIndex: number,
	) => {
		const questions = [...form.getFieldValue("questions")];
		questions[questionIndex].specificCriteria = questions[
			questionIndex
		].specificCriteria.filter((_: unknown, i: number) => i !== criteriaIndex);
		form.setFieldValue("questions", questions);
	};

	return {
		form,
		scriptId: initialData.id,
		isPending: mutation.isPending,
		addQuestion,
		removeQuestion,
		addSpecificCriterion,
		removeSpecificCriterion,
	};
}
