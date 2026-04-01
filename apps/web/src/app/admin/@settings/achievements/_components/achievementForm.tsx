"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

function normalizeOptionalValue(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function AchievementForm({
	achievement,
	onSuccess,
}: AchievementFormProps) {
	const router = useRouter();
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
			const payload = {
				name: value.name,
				description: value.description,
				iconUrl: normalizeOptionalValue(value.iconUrl),
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
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Иконка</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="https://..."
							/>
							<FieldDescription>
								Необязательно. Можно оставить пустым, тогда в списке покажется
								стандартная иконка.
							</FieldDescription>
						</Field>
					)}
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
					disabled={createMutation.isPending || updateMutation.isPending}
				>
					{achievement ? "Обновить" : "Добавить"}
				</Button>
			</div>
		</form>
	);
}
