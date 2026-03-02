"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryRow } from "./categoriesTable";
import { trpc } from "@/lib/trpc";

interface CategoryFormProps {
	category?: CategoryRow;
}

export function CategoryForm({ category }: CategoryFormProps) {
	const router = useRouter();
	const createMutation = useMutation(trpc.category.create.mutationOptions({
		onSuccess: () => {
			toast("Категория успешно добавлена");
			router.refresh();
		},
		onError: (error) => {
			toast(error.message);
		}
	}));
	const updateMutation = useMutation(trpc.category.updateById.mutationOptions({
		onSuccess: () => {
			toast("Категория успешно обновлена");
			router.refresh();
		},
		onError: (error) => {
			toast(error.message);
		}
	}));

	const form = useForm({
		defaultValues: {
			name: category?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			if (category) {
				await updateMutation.mutateAsync({
					id: category.id,
					name: value.name,
				});
				return;
			}

			await createMutation.mutateAsync(value.name);
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
			</div>
			<div className="flex justify-end gap-2 pt-4">
				<Button type="submit" 
					disabled={updateMutation.isPending || createMutation.isPending}>
					{category ? "Обновить" : "Добавить"}
				</Button>
			</div>
		</form>
	);
}
