"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function ExpertForm() {
	const router = useRouter();
	const setMutation = useMutation(
		trpc.expertManager.setUserExpert.mutationOptions({
			onSuccess: () => {
				toast("Пользователь добавлен");
				router.refresh();
			},
			onError: (error) => {
				toast(error.message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			await setMutation.mutateAsync(value.email);
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
				<form.Field name="email">
					{(field) => {
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
				</form.Field>
			</div>
			<div className="flex justify-end gap-2 pt-4">
				<Button type="submit" disabled={setMutation.isPending}>
					Добавить
				</Button>
			</div>
		</form>
	);
}
