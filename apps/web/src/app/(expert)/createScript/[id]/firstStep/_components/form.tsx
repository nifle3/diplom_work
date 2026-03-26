"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
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
				<fieldset disabled={isPending} className="space-y-6">
					<FieldGroup>
						<div className="space-y-3">
							<div className="font-medium text-sm">Картинка курса</div>
							<div className="flex flex-col gap-4 md:flex-row md:items-start">
								<div className="flex h-48 w-full items-center justify-center overflow-hidden border border-input border-dashed bg-muted/20 md:w-80">
									{imageSrc ? (
										<Image
											src={imageSrc}
											alt="Превью курса"
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground text-sm">
											<ImageIcon className="h-8 w-8" />
											<span>Превью появится после выбора изображения</span>
										</div>
									)}
								</div>

								<div className="space-y-3">
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
									<Button
										type="button"
										variant="outline"
										onClick={() => fileInputRef.current?.click()}
									>
										{imageSrc ? "Заменить картинку" : "Выбрать картинку"}
									</Button>
									<p className="text-muted-foreground text-sm">
										JPG, PNG или WebP, до 4 МБ.
										{selectedImage ? ` Выбрано: ${selectedImage.name}` : ""}
									</p>
								</div>
							</div>
						</div>

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
										placeholder="Название сценария"
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
											className="min-h-24 resize-none"
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
											field.handleChange(val ? Number(val) : (null as never));
										}}
										className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
				</fieldset>

				<div className="mt-6 flex justify-end">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Сохранение..." : "Сохранить и продолжить"}
					</Button>
				</div>
			</form>
		</>
	);
}
