"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "../../_components/formFieldWrapper";
import { StepNavigation } from "../../_components/stepNavigation";
import { useThirdStepForm } from "../_hooks/useThirdStepForm";

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

export function ThirdStepForm({ initialData }: ThirdStepFormProps) {
	const router = useRouter();
	const {
		form,
		scriptId,
		isPending,
		addQuestion,
		removeQuestion,
		addSpecificCriterion,
		removeSpecificCriterion,
	} = useThirdStepForm({ initialData });

	const basePath = `/createScript/${scriptId}`;

	return (
		<>
			<StepNavigation basePath={basePath} currentStep={3} />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="mb-6 space-y-6">
					<FieldLabel className="text-base">Шаблоны вопросов</FieldLabel>

					<form.Field name="questions">
						{(field) => (
							<div className="space-y-6">
								{field.state.value.map((question, qIndex) => (
									<div
										key={question.id}
										className="group relative rounded-lg border border-input p-5 transition-colors hover:border-primary/50"
									>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeQuestion(qIndex)}
											className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
										>
											Удалить вопрос
										</Button>

										<div className="space-y-4">
											<FormFieldWrapper
												label={`Вопрос №${qIndex + 1}`}
												errors={field.state.meta.errors}
												isTouched={field.state.meta.isTouched}
											>
												<Input
													value={question.text}
													onChange={(e) => {
														const next = [...field.state.value];
														next[qIndex] = {
															...next[qIndex],
															text: e.target.value,
														};
														field.handleChange(next);
													}}
													placeholder="Введите текст вопроса..."
													className="bg-background"
												/>
											</FormFieldWrapper>

											<div className="space-y-3 border-muted border-l-2 pl-6">
												<FieldLabel className="text-muted-foreground text-xs uppercase tracking-wider">
													Критерии для этого вопроса
												</FieldLabel>

												<div className="space-y-2">
													{question.specificCriteria.map(
														(criterion, cIndex) => (
															<div
																key={criterion.id}
																className="flex items-center gap-2"
															>
																<Input
																	value={criterion.content}
																	onChange={(e) => {
																		const next = [...field.state.value];
																		const updatedCriteria = [
																			...next[qIndex].specificCriteria,
																		];
																		updatedCriteria[cIndex] = {
																			...updatedCriteria[cIndex],
																			content: e.target.value,
																		};
																		next[qIndex] = {
																			...next[qIndex],
																			specificCriteria: updatedCriteria,
																		};
																		field.handleChange(next);
																	}}
																	placeholder="Критерий оценки..."
																	className="h-8 text-sm"
																/>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		removeSpecificCriterion(qIndex, cIndex)
																	}
																	className="h-8 w-8 p-0"
																>
																	×
																</Button>
															</div>
														),
													)}

													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => addSpecificCriterion(qIndex)}
														className="h-7 text-[10px] uppercase"
													>
														+ Добавить критерий
													</Button>
												</div>
											</div>
										</div>
									</div>
								))}

								<Button
									type="button"
									variant="outline"
									onClick={addQuestion}
									className="w-full border-dashed py-6"
								>
									+ Добавить новый вопрос
								</Button>
							</div>
						)}
					</form.Field>
				</div>

				<div className="mt-8 flex justify-end gap-4 border-t pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push(`${basePath}/secondStep` as Route)}
					>
						Назад
					</Button>
					<Button type="submit" disabled={isPending} size="lg">
						{isPending ? "Сохранение..." : "Создать скрипт"}
					</Button>
				</div>
			</form>
		</>
	);
}
