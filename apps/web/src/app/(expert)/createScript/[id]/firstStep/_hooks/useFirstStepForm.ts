"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@/lib/trpc";

export const firstStepFormSchema = z.object({
	title: z
		.string()
		.min(5, "Название должно быть больше 5 символов")
		.max(50, "Название должно быть меньше 50 символов"),
	description: z.string().max(500).nullable(),
	categoryId: z.number().positive("Выберите категорию"),
});

export type FirstStepFormValues = z.infer<typeof firstStepFormSchema>;

interface UseFirstStepFormOptions {
	initialData: {
		id: string;
		title: string | null;
		description: string | null;
		categoryId: number | null;
	};
	categories: Array<{ id: number; name: string }>;
}

export function useFirstStepForm({
	initialData,
	categories,
}: UseFirstStepFormOptions) {
	const router = useRouter();

	const mutation = useMutation(
		trpc.createScript.mutateFirstStep.mutationOptions({
			onSuccess: () => {
				router.replace(`/createScript/${initialData.id}/secondStep`);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			title: initialData.title ?? "",
			description: initialData.description ?? null,
			categoryId: initialData.categoryId ?? 0,
		},
		validators: {
			onSubmit: firstStepFormSchema,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({
				scriptId: initialData.id,
				title: value.title,
				description: value.description,
				categoryId: value.categoryId,
			});
		},
	});

	return { form, categories, isPending: mutation.isPending };
}
