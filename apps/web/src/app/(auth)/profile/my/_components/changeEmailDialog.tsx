"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/authClient";
import { changeEmailSchema } from "../_schema/profileSettings";

export function ChangeEmailDialog({ email }: { email: string }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [currentEmail, setCurrentEmail] = useState(email);

	const mutation = useMutation({
		mutationFn: async ({ email }: { email: string }) => {
			await authClient.changeEmail({ newEmail: email });
		},
		onSuccess: (_, variables) => {
			setCurrentEmail(variables.email);
			toast("Почта обновлена");
			setOpen(false);
			form.reset({
				email: variables.email,
			});
			router.refresh();
		},
		onError: (error) => {
			toast(
				error instanceof Error ? error.message : "Не удалось обновить почту",
			);
		},
	});

	const form = useForm({
		defaultValues: { email: currentEmail },
		onSubmit: async ({ value }) => {
			const normalizedEmail = value.email.trim().toLowerCase();
			const parsed = changeEmailSchema.safeParse({ email: normalizedEmail });

			if (!parsed.success) {
				toast(parsed.error.issues[0]?.message ?? "Некорректный email");
				return;
			}

			if (parsed.data.email === currentEmail) {
				toast("Укажите новый email");
				return;
			}

			await mutation.mutateAsync(parsed.data);
		},
	});

	useEffect(() => {
		setCurrentEmail(email);
		form.reset({ email });
	}, [email, form, setCurrentEmail]);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					form.reset({ email: currentEmail });
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
				>
					<Mail className="mr-2 h-4 w-4" />
					Почта
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Изменить почту</DialogTitle>
					<DialogDescription>
						Укажите новый email для входа в аккаунт.
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.Field name="email">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={mutation.isPending}
								/>
								<FieldError
									errors={field.state.meta.errors.map((message) => ({
										message: String(message),
									}))}
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
