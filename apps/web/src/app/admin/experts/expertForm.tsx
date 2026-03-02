"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ExpertRow } from "./expertsTable";

interface ExpertFormProps {
	expert?: ExpertRow;
	onSuccess: () => void;
}

export function ExpertForm({ expert, onSuccess }: ExpertFormProps) {
	const form = useForm({
		defaultValues: {
			name: expert?.name ?? "",
			email: expert?.email ?? "",
			isActive: expert?.isActive ?? true,
		},
		onSubmit: async ({ value }) => {
			try {
				if (expert) {
					toast("Эксперт обновлен");
				} else {
					toast("Эксперт добавлен");
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
								<FieldLabel htmlFor={field.name}>Имя</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Введите имя эксперта"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="email"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="example@mail.ru"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="isActive"
					children={(field) => {
						return (
							<Field orientation="horizontal">
								<input
									type="checkbox"
									id={field.name}
									checked={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.checked)}
									className="size-4"
								/>
								<FieldLabel htmlFor={field.name} className="font-normal">
									Активен
								</FieldLabel>
							</Field>
						);
					}}
				/>
			</div>
			<div className="flex justify-end gap-2 pt-4">
				<Button type="submit">{expert ? "Обновить" : "Добавить"}</Button>
			</div>
		</form>
	);
}
