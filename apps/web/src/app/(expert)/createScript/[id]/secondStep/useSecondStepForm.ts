"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/lib/trpc";

const criteriaSchema = z.object({
	id: z.uuid().nullable(),
	typeId: z.number().int().positive(),
	content: z.string().min(1, "Содержание критерия обязательно"),
});

export const secondStepFormSchema = z.object({
	context: z.string().max(1000, "Максимальное количество символов 1000"),
	criteria: z.array(criteriaSchema).min(1, "Добавьте хотя бы один критерий"),
	deletedCriteria: z.array(z.uuid()).nullable(),
});

export type SecondStepFormValues = z.infer<typeof secondStepFormSchema>;

interface UseSecondStepFormOptions {
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

export function useSecondStepForm({
	initialData,
	criteriaTypes,
}: UseSecondStepFormOptions) {
	const router = useRouter();

	const mutation = useMutation(
		trpc.createScript.mutateSecondStep.mutationOptions({
			onSuccess: () => {
				toast.success("Сохранено");
				router.replace(`/createScript/${initialData.id}/thirdStep`);
			},
			onError: (error: unknown) => {
				const message =
					error instanceof Error ? error.message : "Ошибка при сохранении";
				toast.error(message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			context: initialData.context ?? "",
			criteria: initialData.globalCriteria.map((c) => ({
				id: c.id,
				typeId: c.typeId,
				content: c.content,
			})),
			deletedCriteria: [] as unknown as SecondStepFormValues["deletedCriteria"],
		} as SecondStepFormValues,
		validators: {
			onSubmit: secondStepFormSchema as never,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate({
				scriptId: initialData.id,
				context: value.context,
				criteria: value.criteria,
				deletedCriteria: value.deletedCriteria,
			});
		},
	});

	const addCriterion = () => {
		form.setFieldValue("criteria", [
			...form.getFieldValue("criteria"),
			{ id: null, typeId: criteriaTypes[0]?.id ?? 1, content: "" },
		]);
	};

	const removeCriterion = (index: number) => {
		const criteria = form.getFieldValue("criteria");
		const removed = criteria[index];
		if (removed.id) {
			const currentDeleted = form.getFieldValue("deletedCriteria") ?? [];
			form.setFieldValue("deletedCriteria", [...currentDeleted, removed.id]);
		}
		form.setFieldValue(
			"criteria",
			criteria.filter((_: unknown, i: number) => i !== index),
		);
	};

	return {
		form,
		criteriaTypes,
		scriptId: initialData.id,
		isPending: mutation.isPending,
		addCriterion,
		removeCriterion,
	};
}
