"use client";

import { Field } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileForm } from "../_hooks/useProfileForm";
import { AvatarField } from "./avatarField";

type EditProfileFormProps = {
	initialEmail: string;
	initialAvatarUrl?: string | null;
};

export function EditProfileForm({
	initialEmail,
	initialAvatarUrl,
}: EditProfileFormProps) {
	const {
		form,
		previewUrl,
		fileInputRef,
		handleAvatarChange,
		triggerFileSelect,
		handleSubmit,
		isSubmitting,
	} = useProfileForm({
		defaultValues: {
			email: initialEmail,
		},
		onSubmit: async (values) => {
			console.log("Сохраняем:", values);
			await new Promise((r) => setTimeout(r, 1400));
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleSubmit();
			}}
			className="space-y-6"
		>
			<AvatarField
				previewUrl={previewUrl}
				initialAvatarUrl={initialAvatarUrl}
				initialEmail={initialEmail}
				triggerFileSelect={triggerFileSelect}
				fileInputRef={fileInputRef}
				handleAvatarChange={handleAvatarChange}
				isSubmitting={isSubmitting}
			/>

			<Field
				name="email"
				form={form}
			>
				{
					(field) => (
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isSubmitting}
						/>
						{field.state.meta.errors ? (
							<p className="text-destructive text-sm">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
					</div>
				)}
			</Field>

			<div className="grid gap-4 md:grid-cols-2">
				<Field
					name="password"
					form={form}
				>
					{
						(field) => (
						<div className="space-y-2">
							<Label htmlFor="password">Новый пароль</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isSubmitting}
							/>
							{field.state.meta.errors ? (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)
					}
				</Field>

				<Field
					name="confirmPassword"
					form={form}
				>
					{
						(field) => (
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Повторите пароль</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isSubmitting}
							/>
							{field.state.meta.errors ? (
								<p className="text-destructive text-sm">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)
					}
				</Field>
			</div>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				Сохранить изменения
			</Button>
		</form>
	);
}
