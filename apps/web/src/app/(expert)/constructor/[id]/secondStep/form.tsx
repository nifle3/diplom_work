"use client";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";

import { useSecondStepForm } from "./useSecondStepForm";

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

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field
					name="context"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Контекст сценария</FieldLabel>
								<InputGroup>
									<InputGroupTextarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={10}
										className="min-h-24 resize-none"
										aria-invalid={isInvalid}
										placeholder="Опишите контекст интервью, целевую аудиторию, какие навыки нужно продемонстрировать..."
									/>
									<InputGroupAddon align="block-end">
										<InputGroupText className="tabular-nums">
											{field.state.value.length}/1000
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			<div className="mt-8">
				<FieldLabel>Критерии оценки</FieldLabel>
				<form.Field
					name="criteria"
					children={(field) => {
						return (
							<div className="mt-2 space-y-4">
								{field.state.value.map((criterion, index) => (
									<div key={index} className="flex items-start gap-2">
										<select
											value={criterion.typeId}
											onChange={(e) => {
												const newCriteria = [...field.state.value];
												newCriteria[index] = {
													...newCriteria[index],
													typeId: Number(e.target.value),
												};
												field.handleChange(newCriteria);
											}}
											className="flex h-10 w-40 rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
												const newCriteria = [...field.state.value];
												newCriteria[index] = {
													...newCriteria[index],
													content: e.target.value,
												};
												field.handleChange(newCriteria);
											}}
											placeholder="Содержание критерия"
											className="flex-1"
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeCriterion(index)}
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
								>
									+ Добавить критерий
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
						window.location.href = `/constructor/${scriptId}/firstStep`;
					}}
				>
					Назад
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Сохранение..." : "Сохранить и продолжить"}
				</Button>
			</div>
		</form>
	);
}
