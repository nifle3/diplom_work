"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useThirdStepForm } from "./useThirdStepForm";

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
	const {
		form,
		scriptId,
		isPending,
		addQuestion,
		removeQuestion,
		addSpecificCriterion,
		removeSpecificCriterion,
	} = useThirdStepForm({ initialData });

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
						window.location.href = `/createScript/${scriptId}/secondStep`;
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
