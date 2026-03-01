"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

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
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
	title: z
		.string()
		.min(5, "Название должно быть больше 5 символов")
		.max(50, "Название должно быть меньше 50 символов"),
	description: z.string().max(500).nullable(),
	categoryId: z.number().positive("Выберите категорию"),
});

type FormValues = z.infer<typeof formSchema>;

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
	const router = useRouter();

	const mutation = useMutation(
		trpc.createScript.mutateFirstStep.mutationOptions({
			onSuccess: () => {
				toast.success("Сохранено");
				router.replace(`/constructor/${initialData.id}/secondStep`);
			},
			onError: (error: unknown) => {
				toast.error((error as Error).message);
			},
		}),
	);

	const handleSubmit = (values: FormValues) => {
		mutation.mutate({
			scriptId: initialData.id,
			title: values.title,
			descripton: values.description,
			categoryId: values.categoryId,
		});
	};

	return (
		<FirstStepFormInner
			defaultValues={{
				title: initialData?.title ?? "",
				description: initialData?.description ?? null,
				categoryId: initialData?.categoryId ?? 0,
			}}
			categories={categories}
			onSubmit={handleSubmit}
			isPending={mutation.isPending}
		/>
	);
}

interface FirstStepFormInnerProps {
	defaultValues: FormValues;
	categories: Array<{ id: number; name: string }>;
	onSubmit: (values: FormValues) => void;
	isPending: boolean;
}

import { useForm } from "@tanstack/react-form";

function FirstStepFormInner({
	defaultValues,
	categories,
	onSubmit,
	isPending,
}: FirstStepFormInnerProps) {
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			onSubmit(value);
		},
	});

	return (
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
								<FieldLabel htmlFor={field.name}>Название сценария</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Название сценария"
									autoComplete="off"
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
	);
}
