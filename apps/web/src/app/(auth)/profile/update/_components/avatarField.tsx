"use client";

import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type AvatarFieldProps = {
	previewUrl: string | null;
	initialAvatarUrl?: string | null;
	initialEmail: string;
	triggerFileSelect: () => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isSubmitting: boolean;
};

export function AvatarField({
	previewUrl,
	initialAvatarUrl,
	initialEmail,
	triggerFileSelect,
	fileInputRef,
	handleAvatarChange,
	isSubmitting,
}: AvatarFieldProps) {
	const src = previewUrl || initialAvatarUrl || undefined;
	const fallback = initialEmail?.[0]?.toUpperCase() ?? "?";

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative">
				<Avatar className="h-24 w-24 border-4 border-background shadow-xl">
					<AvatarImage src={src} alt="Аватар" />
					<AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
				</Avatar>

				<Button
					type="button"
					size="icon"
					variant="secondary"
					className="absolute -right-2 -bottom-2 rounded-full shadow-md"
					onClick={triggerFileSelect}
					disabled={isSubmitting}
				>
					<Upload className="h-4 w-4" />
				</Button>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="hidden"
					onChange={handleAvatarChange}
				/>
			</div>

			<p className="text-muted-foreground text-sm">
				{previewUrl ? "Новое фото выбрано" : "Нажмите, чтобы сменить аватар"}
			</p>
		</div>
	);
}
