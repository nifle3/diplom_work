"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useFileUpload } from "@/hooks/useFileUpload";
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

const courseImageSchema = z
	.custom<File>((value) => value instanceof File, "Выберите файл")
	.refine(
		(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
		{ message: "Только jpg, png, webp" },
	)
	.refine((file) => file.size <= 4 * 1024 * 1024, {
		message: "Файл не больше 4 МБ",
	});

interface UseFirstStepFormOptions {
	initialData: {
		id: string;
		title: string | null;
		image: string | null;
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
	const { uploadFile, isUploading } = useFileUpload();
	const [selectedImage, setSelectedImage] = useState<File | null>(null);

	const mutation = useMutation(
		trpc.createScript.mutateFirstStep.mutationOptions({
			onSuccess: () => {
				router.replace(`/createScript/${initialData.id}/secondStep` as Route);
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
			let image = initialData.image;

			if (selectedImage) {
				const parsedImage = courseImageSchema.safeParse(selectedImage);

				if (!parsedImage.success) {
					toast.error(
						parsedImage.error.issues[0]?.message ?? "Выберите изображение",
					);
					return;
				}

				image = await uploadFile(parsedImage.data, { folder: "scripts" });
			}

			mutation.mutate({
				scriptId: initialData.id,
				title: value.title,
				image,
				description: value.description,
				categoryId: value.categoryId,
			});
		},
	});

	return {
		form,
		categories,
		selectedImage,
		setSelectedImage,
		isPending: mutation.isPending || isUploading,
	};
}
