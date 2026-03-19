"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useFileUpload } from "@/hooks/useFileUpload";
import { getAssetUrl } from "@/lib/assetUrl";
import { authClient } from "@/lib/authClient";
import { avatarFileSchema } from "../_schema/profileSettings";

type ChangeAvatarDialogProps = {
	email: string;
	image?: string | null;
	name: string;
};

export function ChangeAvatarDialog({
	email,
	image,
	name,
}: ChangeAvatarDialogProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadFile, isUploading } = useFileUpload();
	const [open, setOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: async ({ avatar }: { avatar: File }) => {
			const key = await uploadFile(avatar, { folder: "avatars" });
			await authClient.updateUser({ image: key });
		},
		onSuccess: () => {
			toast("Аватар обновлён");
			setOpen(false);
			setPreviewUrl(null);
			form.reset();
			router.refresh();
		},
		onError: (error) => {
			toast(error instanceof Error ? error.message : error);
		},
	});

	const form = useForm({
		defaultValues: {
			avatar: undefined as File | undefined,
		},
		onSubmit: async ({ value }) => {
			const parsed = avatarFileSchema.safeParse(value.avatar);

			if (!parsed.success) {
				toast(parsed.error.issues[0]?.message ?? "Выберите изображение");
				return;
			}

			await mutation.mutateAsync({ avatar: parsed.data });
		},
	});

	const avatarSrc = previewUrl ?? getAssetUrl(image);
	const fallback = name[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? "?";
	const isPending = mutation.isPending || isUploading;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					setPreviewUrl(null);
					form.reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
				>
					<Camera className="mr-2 h-4 w-4" />
					Фото
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Обновить фото</DialogTitle>
					<DialogDescription>
						Загрузите новый аватар в формате jpg, png или webp.
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="flex flex-col items-center gap-4">
						<Avatar className="h-24 w-24 border shadow-sm">
							<AvatarImage src={avatarSrc} alt={name} />
							<AvatarFallback>{fallback}</AvatarFallback>
						</Avatar>
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

								const nextPreview = URL.createObjectURL(file);
								setPreviewUrl((prev) => {
									if (prev?.startsWith("blob:")) {
										URL.revokeObjectURL(prev);
									}

									return nextPreview;
								});
								form.setFieldValue("avatar", file);
							}}
						/>
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => fileInputRef.current?.click()}
						>
							Выбрать файл
						</Button>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Сохранить
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
