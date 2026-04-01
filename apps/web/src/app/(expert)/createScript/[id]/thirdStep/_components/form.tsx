"use client";

import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
				<Card className="overflow-hidden border-border/60 bg-card/90 shadow-foreground/5 shadow-xl backdrop-blur">
					<CardHeader className="border-border/60 border-b px-5 pt-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">Шаг 3</Badge>
							<Badge variant="outline">Финальная публикация</Badge>
						</div>
						<CardTitle className="text-xl tracking-tight sm:text-2xl">
							Соберите шаблоны вопросов
						</CardTitle>
						<CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
							На этом шаге сценарий уже практически готов. Добавьте вопросы,
							критерии внутри каждого вопроса и затем опубликуйте черновик.
						</CardDescription>
					</CardHeader>

					<CardContent className="px-5 pt-5">
						<fieldset disabled={isPending}>
							<div className="flex flex-col gap-5">
								<div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
									<div className="mb-4 flex items-center justify-between gap-2">
										<div className="flex flex-col gap-1">
											<FieldLabel className="text-base">
												Шаблоны вопросов
											</FieldLabel>
											<p className="text-muted-foreground text-xs sm:text-sm">
												Для каждого вопроса можно добавить один или несколько
												локальных критериев.
											</p>
										</div>
										<Badge variant="secondary">Черновик</Badge>
									</div>

									<form.Field name="questions">
										{(field) => (
											<div className="flex flex-col gap-4">
												{field.state.value.map((question, qIndex) => (
													<div
														key={question.id ?? `${qIndex}`}
														className="group relative rounded-2xl border border-border/60 bg-background/90 p-3 shadow-sm transition-colors hover:border-primary/40"
													>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeQuestion(qIndex)}
															className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
														>
															Удалить
														</Button>

														<div className="flex flex-col gap-4">
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
																/>
															</FormFieldWrapper>

															<div className="rounded-xl border border-border/60 border-l-4 border-l-primary/30 bg-muted/20 p-3">
																<div className="mb-3 flex items-center justify-between gap-2">
																	<FieldLabel className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
																		Критерии для этого вопроса
																	</FieldLabel>
																	<Badge variant="outline" className="h-7 px-2">
																		{question.specificCriteria.length} шт.
																	</Badge>
																</div>

																<div className="flex flex-col gap-2">
																	{question.specificCriteria.map(
																		(criterion, cIndex) => (
																			<div
																				key={
																					criterion.id ?? `${qIndex}-${cIndex}`
																				}
																				className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]"
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
																					className="bg-background"
																				/>

																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					onClick={() =>
																						removeSpecificCriterion(
																							qIndex,
																							cIndex,
																						)
																					}
																					className="justify-start text-destructive hover:text-destructive md:justify-center"
																				>
																					Удалить
																				</Button>
																			</div>
																		),
																	)}

																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => addSpecificCriterion(qIndex)}
																		className="border-dashed"
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
													className="border-dashed py-4"
												>
													+ Добавить новый вопрос
												</Button>
											</div>
										)}
									</form.Field>
								</div>
							</div>
						</fieldset>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 border-border/60 border-t bg-gradient-to-b from-background/40 to-background px-5 py-5 sm:flex-row sm:justify-between">
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<Link href={`${basePath}/secondStep` as Route}>Назад</Link>
						</Button>

						<div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
							<p className="text-muted-foreground text-xs leading-5">
								После публикации черновик станет обычным курсом в системе.
							</p>
							<Button
								type="submit"
								disabled={isPending}
								size="lg"
								className="w-full sm:w-auto"
							>
								{isPending ? "Публикация..." : "Опубликовать сценарий"}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</form>
		</>
	);
}
