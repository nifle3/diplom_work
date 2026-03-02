"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRow } from "./categories-table";

interface CategoryFormProps {
	category?: CategoryRow;
	onSuccess: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
	const form = useForm({
		defaultValues: {
			name: category?.name ?? "",
			description: category?.description ?? "",
		},
		onSubmit: async ({ value }) => {
			try {
				if (category) {
					toast("Категория обновлена");
				} else {
					toast("Категория добавлена");
				}
				onSuccess();
			} catch {
				toast("Ошибка");
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="space-y-4">
				<form.Field
					name="name"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Название</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Введите название категории"
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
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Введите описание категории"
									rows={4}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</div>
			<div className="flex justify-end gap-2 pt-4">
				<Button type="submit">{category ? "Обновить" : "Добавить"}</Button>
			</div>
		</form>
	);
}
