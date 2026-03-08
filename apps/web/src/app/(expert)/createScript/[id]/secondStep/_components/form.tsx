"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
	const router = useRouter();
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
				<fieldset disabled={isPending} className="space-y-8">
					<FieldGroup>
						{/* Поле: Контекст */}
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
											className="min-h-24 resize-none"
											placeholder="Опишите контекст интервью, целевую аудиторию..."
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

					{/* Секция: Критерии */}
					<div>
						<FieldLabel className="mb-4 block">Критерии оценки</FieldLabel>

						<form.Field name="criteria">
							{(field) => (
								<div className="space-y-4">
									{field.state.value.map((criterion, index) => (
										<div key={criterion.id} className="flex items-start gap-2">
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
												className="flex h-10 w-40 border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
												className="flex-1"
											/>

											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeCriterion(index)}
												className="text-destructive hover:text-destructive"
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
										className="w-full border-dashed"
									>
										+ Добавить критерий
									</Button>
								</div>
							)}
						</form.Field>
					</div>
				</fieldset>

				<div className="mt-8 flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push(`${basePath}/firstStep` as Route)}
					>
						Назад
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Сохранение..." : "Сохранить и продолжить"}
					</Button>
				</div>
			</form>
		</>
	);
}
