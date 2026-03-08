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

	return (
		<>
			<div className="mb-6 flex items-center gap-4">
				<div className="font-medium text-lg">
					Шаг 1 из 3: Основная информация
				</div>
				<div className="ml-auto flex gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							window.location.href = `/createScript/${initialData.id}/firstStep`;
						}}
					>
						1
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							window.location.href = `/createScript/${initialData.id}/secondStep`;
						}}
					>
						2
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							window.location.href = `/createScript/${initialData.id}/thirdStep`;
						}}
					>
						3
					</Button>
				</div>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field
						name="title"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Название сценария
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Название сценария"
										autoComplete="off"
										maxLength={50}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="description"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Описание</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											id={field.name}
											name={field.name}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={10}
											className="min-h-24 resize-none"
											aria-invalid={isInvalid}
											maxLength={1000}
										/>
										<InputGroupAddon align="block-end">
											<InputGroupText className="tabular-nums">
												{field.state.value?.length ?? 0}/500
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="categoryId"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Категория</FieldLabel>
									<select
										id={field.name}
										name={field.name}
										value={field.state.value > 0 ? field.state.value : ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(Number(e.target.value))}
										className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="">Выберите категорию</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</FieldGroup>
				<div className="mt-6 flex justify-end">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Сохранение..." : "Сохранить и продолжить"}
					</Button>
				</div>
			</form>
		</>
	);
}
