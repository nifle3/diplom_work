"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/authClient";
import { changePasswordSchema } from "../_schema/profileSettings";

export function ChangePasswordDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const mutation = useMutation({
		mutationFn: async ({
			currentPassword,
			newPassword,
		}: {
			currentPassword: string;
			newPassword: string;
		}) => {
			await authClient.changePassword({
				currentPassword,
				newPassword,
			});
		},
		onSuccess: () => {
			toast("Пароль обновлён");
			setOpen(false);
			form.reset();
			router.refresh();
		},
		onError: (error) => {
			toast(
				error instanceof Error ? error.message : "Не удалось обновить пароль",
			);
		},
	});

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = changePasswordSchema.safeParse(value);

			if (!parsed.success) {
				toast(parsed.error.issues[0]?.message ?? "Проверьте пароль");
				return;
			}

			await mutation.mutateAsync(parsed.data);
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					form.reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
				>
					<LockKeyhole className="mr-2 h-4 w-4" />
					Пароль
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Сменить пароль</DialogTitle>
					<DialogDescription>
						Введите текущий пароль и задайте новый.
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.Field name="currentPassword">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Текущий пароль</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={mutation.isPending}
								/>
							</Field>
						)}
					</form.Field>
					<form.Field name="newPassword">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Новый пароль</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={mutation.isPending}
								/>
							</Field>
						)}
					</form.Field>
					<form.Field name="confirmPassword">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Повторите пароль</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={mutation.isPending}
								/>
							</Field>
						)}
					</form.Field>
					<DialogFooter>
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? (
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
