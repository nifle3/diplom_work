"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AchievementIcon } from "@/components/achievementIcon";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/useFileUpload";
import { trpc } from "@/lib/trpc";
import type { AchievementRow } from "./achievementsTable";

interface AchievementFormProps {
	achievement?: AchievementRow;
	onSuccess?: () => void;
}

const formulaExamples = [
	"xp >= 1000",
	"streak >= 7",
	"completedInterviews >= 10 && averageScore >= 80",
	"achievementCount >= 3 && completedToday >= 1",
].join(" | ");

const achievementIconSchema = z
	.custom<File>((value) => value instanceof File, "Выберите файл")
	.refine(
		(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
		{ message: "Только jpg, png, webp" },
	)
	.refine((file) => file.size <= 4 * 1024 * 1024, {
		message: "Файл не больше 4 МБ",
	});

function normalizeOptionalValue(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function AchievementForm({
	achievement,
	onSuccess,
}: AchievementFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadFile, isUploading } = useFileUpload();
	const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const createMutation = useMutation(
		trpc.achievement.create.mutationOptions({
			onSuccess: () => {
				toast("Достижение успешно добавлено");
				router.refresh();
				onSuccess?.();
			},
		}),
	);
	const updateMutation = useMutation(
		trpc.achievement.updateById.mutationOptions({
			onSuccess: () => {
				toast("Достижение успешно обновлено");
				router.refresh();
				onSuccess?.();
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			name: achievement?.name ?? "",
			description: achievement?.description ?? "",
			iconUrl: achievement?.iconUrl ?? "",
			formula: achievement?.formula ?? "",
		},
		onSubmit: async ({ value }) => {
			let iconUrl = normalizeOptionalValue(value.iconUrl);

			if (selectedIcon) {
				const parsedIcon = achievementIconSchema.safeParse(selectedIcon);

				if (!parsedIcon.success) {
					toast.error(
						parsedIcon.error.issues[0]?.message ?? "Выберите изображение",
					);
					return;
				}

				iconUrl = await uploadFile(parsedIcon.data, {
					folder: "achievements",
				});
			}

			const payload = {
				name: value.name,
				description: value.description,
				iconUrl,
				formula: value.formula,
			};

			if (achievement) {
				await updateMutation.mutateAsync({
					id: achievement.id,
					...payload,
				});
				return;
			}

			await createMutation.mutateAsync(payload);
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Название</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									maxLength={100}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Например, Мастер стрика"
									aria-invalid={isInvalid}
								/>
								<FieldDescription>
									Короткое название, которое увидят пользователи.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="description">
					{(field) => {
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
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="За что выдаётся достижение"
									aria-invalid={isInvalid}
								/>
								<FieldDescription>
									Объясните условие человеческим языком, чтобы его было легко
									проверять.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="iconUrl">
					{(field) => {
						const iconSrc = previewUrl ?? achievement?.iconUrl ?? null;

						return (
							<Field>
								<FieldLabel htmlFor={field.name}>Иконка</FieldLabel>
								<FieldDescription>
									Необязательно. Можно загрузить JPG, PNG или WebP до 4 МБ.
								</FieldDescription>

								<div className="mt-3 flex flex-col gap-3 rounded-xl border border-border/70 border-dashed bg-muted/20 p-3">
									<div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background p-4">
										<AchievementIcon
											iconUrl={iconSrc}
											alt={achievement?.name ?? "Превью иконки"}
											className="size-24 rounded-2xl"
										/>
									</div>

									<input
										ref={fileInputRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										className="hidden"
										onChange={(event) => {
											const file = event.target.files?.[0];

											if (!file) {
												return;
											}

											const nextPreviewUrl = URL.createObjectURL(file);
											setPreviewUrl((prev) => {
												if (prev?.startsWith("blob:")) {
													URL.revokeObjectURL(prev);
												}

												return nextPreviewUrl;
											});
											setSelectedIcon(file);
										}}
									/>

									<div className="flex flex-col gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
											disabled={isUploading}
										>
											{iconSrc ? "Заменить иконку" : "Выбрать иконку"}
										</Button>
										<p className="text-muted-foreground text-xs leading-5">
											{selectedIcon
												? `Выбран файл: ${selectedIcon.name}`
												: "Файл будет загружен в S3, а в достижении сохранится ключ."}
										</p>
									</div>
								</div>
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="formula">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Формула</FieldLabel>
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="xp >= 1000 && streak >= 7"
									aria-invalid={isInvalid}
								/>
								<FieldDescription>
									Доступные переменные: `xp`, `streak`, `interviewCount`,
									`completedInterviews`, `canceledInterviews`, `averageScore`,
									`bestScore`, `lastScore`, `achievementCount`,
									`interviewsToday`, `completedToday`, `daysSinceLastInterview`,
									`daysSinceLastCompletedInterview`.
								</FieldDescription>
								<FieldDescription>Примеры: {formulaExamples}.</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<div className="flex justify-end gap-2 pt-6">
				<Button
					type="submit"
					disabled={
						createMutation.isPending || updateMutation.isPending || isUploading
					}
				>
					{createMutation.isPending || updateMutation.isPending || isUploading
						? "Сохранение..."
						: achievement
							? "Обновить"
							: "Добавить"}
				</Button>
			</div>
		</form>
	);
}
