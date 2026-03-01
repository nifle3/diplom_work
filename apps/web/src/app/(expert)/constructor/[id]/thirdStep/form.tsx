"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
	questions: z.array(questionTemplateSchema),
	deletedQuestions: z.array(z.uuid()).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ThirdStepFormProps {
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

export default function ThirdStepForm({ initialData }: ThirdStepFormProps) {
	const router = useRouter();
	const params = useParams();
	const scriptId = params.id as string;

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

	const handleSubmit = (values: FormValues) => {
		mutation.mutate({
			scriptId,
			questions: values.questions,
			deletedQuestions: values.deletedQuestions,
		});
	};

	return (
		<ThirdStepFormInner
			scriptId={scriptId}
			defaultValues={{
				questions: initialData.questions.map((q) => ({
					id: q.id,
					text: q.text,
					specificCriteria: q.specificCriteria.map((c) => ({
						id: c.id,
						content: c.content,
					})),
				})),
				deletedQuestions: [],
			}}
			onSubmit={handleSubmit}
			isPending={mutation.isPending}
		/>
	);
}

interface ThirdStepFormInnerProps {
	scriptId: string;
	defaultValues: FormValues;
	onSubmit: (values: FormValues) => void;
	isPending: boolean;
}

import { useForm } from "@tanstack/react-form";

function ThirdStepFormInner({
	scriptId,
	defaultValues,
	onSubmit,
	isPending,
}: ThirdStepFormInnerProps) {
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			onSubmit(value);
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

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="mb-6">
				<FieldLabel>Шаблоны вопросов</FieldLabel>
				<form.Field
					name="questions"
					children={(field) => {
						return (
							<div className="mt-2 space-y-6">
								{field.state.value.map((question, qIndex) => (
									<div
										key={qIndex}
										className="rounded-md border border-input p-4"
									>
										<div className="flex items-start gap-2">
											<Field className="flex-1">
												<FieldLabel className="text-xs">
													Вопрос {qIndex + 1}
												</FieldLabel>
												<Input
													value={question.text}
													onChange={(e) => {
														const newQuestions = [...field.state.value];
														newQuestions[qIndex] = {
															...newQuestions[qIndex],
															text: e.target.value,
														};
														field.handleChange(newQuestions);
													}}
													placeholder="Текст вопроса..."
												/>
												{!question.text &&
													qIndex ===
														field.state.value.findIndex((q) => !q.text) && (
														<FieldError>
															{
																z
																	.string()
																	.min(1, "Текст вопроса обязателен")
																	.safeParse("").error?.message
															}
														</FieldError>
													)}
											</Field>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeQuestion(qIndex)}
											>
												Удалить
											</Button>
										</div>

										<div className="mt-4">
											<FieldLabel className="text-xs">
												Критерии оценки для этого вопроса
											</FieldLabel>
											<div className="mt-2 space-y-2">
												{question.specificCriteria.map((criterion, cIndex) => (
													<div key={cIndex} className="flex items-start gap-2">
														<Input
															value={criterion.content}
															onChange={(e) => {
																const newQuestions = [...field.state.value];
																newQuestions[qIndex].specificCriteria[cIndex] =
																	{
																		...newQuestions[qIndex].specificCriteria[
																			cIndex
																		],
																		content: e.target.value,
																	};
																field.handleChange(newQuestions);
															}}
															placeholder="Критерий оценки..."
															className="flex-1"
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeSpecificCriterion(qIndex, cIndex)
															}
														>
															×
														</Button>
													</div>
												))}
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => addSpecificCriterion(qIndex)}
												>
													+ Добавить критерий
												</Button>
											</div>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addQuestion}
								>
									+ Добавить вопрос
								</Button>
							</div>
						);
					}}
				/>
			</div>

			<div className="mt-6 flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						window.location.href = `/constructor/${scriptId}/secondStep`;
					}}
				>
					Назад
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Сохранение..." : "Создать скрипт"}
				</Button>
			</div>
		</form>
	);
}
