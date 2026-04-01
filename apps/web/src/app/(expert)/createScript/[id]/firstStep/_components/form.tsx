"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
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
import { getAssetUrl } from "@/lib/assetUrl";
import { FormFieldWrapper } from "../../_components/formFieldWrapper";
import { StepNavigation } from "../../_components/stepNavigation";
import { useFirstStepForm } from "../_hooks/useFirstStepForm";

interface FirstStepFormProps {
	initialData: {
		id: string;
		title: string | null;
		image: string | null;
		description: string | null;
		categoryId: number | null;
	};
	categories: Array<{ id: number; name: string }>;
}

export default function FirstStepForm({
	initialData,
	categories,
}: FirstStepFormProps) {
	const { form, isPending, selectedImage, setSelectedImage } = useFirstStepForm(
		{
			initialData,
			categories,
		},
	);
	const basePath = `/createScript/${initialData.id}`;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const imageSrc = previewUrl ?? getAssetUrl(initialData.image);

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	return (
		<>
			<StepNavigation basePath={basePath} currentStep={1} />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Card className="overflow-hidden border-border/60 bg-card/90 shadow-foreground/5 shadow-xl backdrop-blur">
					<CardHeader className="border-border/60 border-b px-5 pt-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">Шаг 1</Badge>
							<Badge variant="outline">Основная информация</Badge>
						</div>
						<CardTitle className="text-xl tracking-tight sm:text-2xl">
							Соберите основу курса
						</CardTitle>
						<CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
							Название, описание, категория и обложка задают первое впечатление
							от сценария, поэтому этот шаг вынесен в отдельную визуальную зону.
						</CardDescription>
					</CardHeader>

					<CardContent className="px-5 pt-5">
						<fieldset disabled={isPending}>
							<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
								<FieldGroup className="gap-4">
									<form.Field name="title">
										{(field) => (
											<FormFieldWrapper
												label="Название сценария"
												errors={field.state.meta.errors}
												isTouched={field.state.meta.isTouched}
											>
												<Input
													name={field.name}
													value={field.state.value ?? ""}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Например, Интервью на позицию middle frontend"
												/>
											</FormFieldWrapper>
										)}
									</form.Field>

									<form.Field name="description">
										{(field) => (
											<FormFieldWrapper
												label="Описание"
												errors={field.state.meta.errors}
												isTouched={field.state.meta.isTouched}
											>
												<InputGroup>
													<InputGroupTextarea
														name={field.name}
														value={field.state.value ?? ""}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														rows={10}
														className="min-h-32 resize-none"
														placeholder="Кратко опишите, что это за курс и кому он подойдет"
													/>
													<InputGroupAddon align="block-end">
														<InputGroupText className="tabular-nums">
															{field.state.value?.length ?? 0}/1000
														</InputGroupText>
													</InputGroupAddon>
												</InputGroup>
											</FormFieldWrapper>
										)}
									</form.Field>

									<form.Field name="categoryId">
										{(field) => (
											<FormFieldWrapper
												label="Категория"
												errors={field.state.meta.errors}
												isTouched={field.state.meta.isTouched}
											>
												<select
													name={field.name}
													value={field.state.value ?? ""}
													onBlur={field.handleBlur}
													onChange={(e) => {
														const val = e.target.value;
														field.handleChange(
															val ? Number(val) : (null as never),
														);
													}}
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50"
												>
													<option value="">Выберите категорию</option>
													{categories.map((cat) => (
														<option key={cat.id} value={cat.id}>
															{cat.name}
														</option>
													))}
												</select>
											</FormFieldWrapper>
										)}
									</form.Field>
								</FieldGroup>

								<Field data-invalid={false} className="gap-2">
									<FieldLabel>Обложка курса</FieldLabel>
									<FieldDescription>
										Изображение помогает визуально выделить курс в списках и
										карточках.
									</FieldDescription>

									<div className="flex flex-col gap-3 rounded-2xl border border-border/70 border-dashed bg-muted/30 p-3">
										<div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/90">
											{imageSrc ? (
												<Image
													src={imageSrc}
													alt="Превью курса"
													className="h-full w-full object-cover"
													width={640}
													height={384}
													unoptimized
												/>
											) : (
												<div className="flex flex-col items-center gap-3 px-6 text-center text-muted-foreground">
													<div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/50">
														<ImageIcon />
													</div>
													<div className="flex flex-col gap-1">
														<p className="font-medium text-foreground">
															Превью пока не выбрано
														</p>
														<p className="text-sm">
															Добавьте обложку, и она сразу появится здесь.
														</p>
													</div>
												</div>
											)}
										</div>

										<input
											ref={fileInputRef}
											type="file"
											accept="image/jpeg,image/png,image/webp"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];

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
												setSelectedImage(file);
											}}
										/>

										<div className="flex flex-col gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => fileInputRef.current?.click()}
											>
												{imageSrc ? "Заменить обложку" : "Выбрать обложку"}
											</Button>
											<p className="text-muted-foreground text-xs leading-5 sm:text-sm">
												JPG, PNG или WebP, до 4 МБ.
												{selectedImage ? ` Выбрано: ${selectedImage.name}` : ""}
											</p>
										</div>
									</div>
								</Field>
							</div>
						</fieldset>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 border-border/60 border-t bg-gradient-to-b from-background/40 to-background px-5 py-5 sm:flex-row sm:justify-end">
						<Button
							type="submit"
							disabled={isPending}
							className="w-full sm:w-auto"
						>
							{isPending ? "Сохранение..." : "Сохранить и продолжить"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</>
	);
}
