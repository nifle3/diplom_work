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
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { FormFieldWrapper } from "../../_components/formFieldWrapper";
import { StepNavigation } from "../../_components/stepNavigation";
import { useSecondStepForm } from "../_hooks/useSecondStepForm";

interface SecondStepFormProps {
	initialData: {
		id: string;
		context: string | null;
		globalCriteria: Array<{
			id: string;
			typeId: number;
			content: string;
		}>;
	};
	criteriaTypes: Array<{ id: number; name: string }>;
}

export default function SecondStepForm({
	initialData,
	criteriaTypes,
}: SecondStepFormProps) {
	const { form, scriptId, isPending, addCriterion, removeCriterion } =
		useSecondStepForm({ initialData, criteriaTypes });

	const basePath = `/createScript/${scriptId}`;

	return (
		<>
			<StepNavigation basePath={basePath} currentStep={2} />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Card className="overflow-hidden border-border/60 bg-card/90 shadow-xl shadow-foreground/5 backdrop-blur">
					<CardHeader className="border-b border-border/60 px-5 pt-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">Шаг 2</Badge>
							<Badge variant="outline">Критерии оценки</Badge>
						</div>
						<CardTitle className="text-xl tracking-tight sm:text-2xl">
							Задайте контекст и критерии
						</CardTitle>
						<CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
							Здесь фиксируется общая рамка интервью и критерии, по которым
							будет оцениваться результат. Шаг удобно редактировать, потому что
							вся форма собрана блоками.
						</CardDescription>
					</CardHeader>

					<CardContent className="px-5 pt-5">
						<fieldset disabled={isPending}>
							<div className="flex flex-col gap-5">
								<FieldGroup className="gap-4">
									<form.Field name="context">
										{(field) => (
											<FormFieldWrapper
												label="Контекст сценария"
												errors={field.state.meta.errors}
												isTouched={field.state.meta.isTouched}
											>
												<InputGroup>
													<InputGroupTextarea
														name={field.name}
														value={field.state.value ?? ""}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														rows={10}
														className="min-h-32 resize-none"
														placeholder="Опишите контекст интервью, целевую аудиторию и уровень кандидата"
													/>
													<InputGroupAddon align="block-end">
														<InputGroupText className="tabular-nums">
															{field.state.value?.length ?? 0}/1000
														</InputGroupText>
													</InputGroupAddon>
												</InputGroup>
											</FormFieldWrapper>
										)}
									</form.Field>
								</FieldGroup>

								<div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
									<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
										<div className="flex flex-col gap-1">
											<FieldLabel className="text-base">Критерии оценки</FieldLabel>
											<p className="text-muted-foreground text-xs sm:text-sm">
												Добавляйте критерии, которые помогут оценивать ответы
												на интервью.
											</p>
										</div>
										<form.Field name="criteria">
											{(field) => (
												<Badge variant="secondary" className="h-8 px-3">
													{field.state.value.length} шт.
												</Badge>
											)}
										</form.Field>
									</div>

									<form.Field name="criteria">
										{(field) => (
											<div className="flex flex-col gap-3">
												{field.state.value.map((criterion, index) => (
													<div
														key={criterion.id ?? `${index}`}
														className="grid gap-3 rounded-xl border border-border/60 bg-background/90 p-3 md:grid-cols-[170px_minmax(0,1fr)_auto]"
													>
														<select
															value={criterion.typeId}
															onChange={(e) => {
																const next = [...field.state.value];
																next[index] = {
																	...next[index],
																	typeId: Number(e.target.value),
																};
																field.handleChange(next);
															}}
															className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
														>
															{criteriaTypes.map((type) => (
																<option key={type.id} value={type.id}>
																	{type.name}
																</option>
															))}
														</select>

														<Input
															value={criterion.content}
															onChange={(e) => {
																const next = [...field.state.value];
																next[index] = {
																	...next[index],
																	content: e.target.value,
																};
																field.handleChange(next);
															}}
															placeholder="Содержание критерия"
														/>

														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeCriterion(index)}
															className="justify-start text-destructive hover:text-destructive md:justify-center"
														>
															Удалить
														</Button>
													</div>
												))}

												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={addCriterion}
													className="border-dashed"
												>
													+ Добавить критерий
												</Button>
											</div>
										)}
									</form.Field>
								</div>
							</div>
						</fieldset>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-gradient-to-b from-background/40 to-background px-5 py-5 sm:flex-row sm:justify-between">
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<Link href={`${basePath}/firstStep` as Route}>Назад</Link>
						</Button>

						<Button type="submit" disabled={isPending} className="w-full sm:w-auto">
							{isPending ? "Сохранение..." : "Сохранить и продолжить"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</>
	);
}
