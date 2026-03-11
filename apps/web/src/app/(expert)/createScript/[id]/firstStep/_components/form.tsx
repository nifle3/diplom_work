"use client";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { FormFieldWrapper } from "../../_components/formFieldWrapper";
import { StepNavigation } from "../../_components/stepNavigation";
import { useFirstStepForm } from "../_hooks/useFirstStepForm";

interface FirstStepFormProps {
	initialData: {
		id: string;
		title: string | null;
		description: string | null;
		categoryId: number | null;
	};
	categories: Array<{ id: number; name: string }>;
}

export default function FirstStepForm({
	initialData,
	categories,
}: FirstStepFormProps) {
	const { form, isPending } = useFirstStepForm({ initialData, categories });
	const basePath = `/createScript/${initialData.id}`;

	return (
		<>
			<StepNavigation basePath={basePath} currentStep={1} />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<fieldset disabled={isPending} className="space-y-6">
					<FieldGroup>
						{/* Поле: Название */}
						<form.Field name="title">
							{(field) => (
								<FormFieldWrapper
									label="Название сценария"
									errors={field.state.meta.errors}
									isTouched={field.state.meta.isTouched}
								>
									<Input
										name={field.name}
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Название сценария"
									/>
								</FormFieldWrapper>
							)}
						</form.Field>

						{/* Поле: Описание */}
						<form.Field name="description">
							{(field) => (
								<FormFieldWrapper
									label="Описание"
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

						{/* Поле: Категория */}
						<form.Field name="categoryId">
							{(field) => (
								<FormFieldWrapper
									label="Категория"
									errors={field.state.meta.errors}
									isTouched={field.state.meta.isTouched}
								>
									<select
										name={field.name}
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											field.handleChange(val ? Number(val) : (null as uknown));
										}}
										className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<option value="">Выберите категорию</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
									</select>
								</FormFieldWrapper>
							)}
						</form.Field>
					</FieldGroup>
				</fieldset>

				<div className="mt-6 flex justify-end">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Сохранение..." : "Сохранить и продолжить"}
					</Button>
				</div>
			</form>
		</>
	);
}
