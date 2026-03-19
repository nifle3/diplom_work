"use client";

import { useForm } from "@tanstack/react-form";
import { type ChangeEvent, useRef, useState } from "react";
import { type ProfileFormValues, profileFormSchema } from "../_scheme/profile";

type UseProfileFormProps = {
	defaultValues: Partial<ProfileFormValues>;
	onSubmit: (values: ProfileFormValues) => Promise<void>;
};

export function useProfileForm({
	defaultValues,
	onSubmit,
}: UseProfileFormProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm({
		defaultValues: {
			email: defaultValues.email ?? "",
			password: "",
			confirmPassword: "",
			avatar: undefined as File | undefined,
		},
		validators: {},
	});

	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		form.setFieldValue("avatar", file);
	};

	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async () => {};

	return {
		form,
		previewUrl,
		fileInputRef,
		handleAvatarChange,
		triggerFileSelect,
		handleSubmit,
		isSubmitting: form.state.isSubmitting,
	};
}
