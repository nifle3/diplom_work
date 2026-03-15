"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";

type RequestResetValues = {
	email: string;
};

type ResetPasswordValues = {
	newPassword: string;
	confirmPassword: string;
};

export function useForgotPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");
	const isResetMode = Boolean(token);

	const [isPending, setIsPending] = useState(false);
	const [requestValues, setRequestValues] = useState<RequestResetValues>({
		email: "",
	});
	const [resetValues, setResetValues] = useState<ResetPasswordValues>({
		newPassword: "",
		confirmPassword: "",
	});

	const handleRequestChange =
		(field: keyof RequestResetValues) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			setRequestValues((prev) => ({ ...prev, [field]: event.target.value }));
		};

	const handleResetChange =
		(field: keyof ResetPasswordValues) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			setResetValues((prev) => ({ ...prev, [field]: event.target.value }));
		};

	const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsPending(true);

		try {
			await authClient.$fetch("/request-password-reset", {
				method: "POST",
				body: {
					email: requestValues.email,
					redirectTo: `${window.location.origin}/forgotPassword`,
				},
			});

			toast.success(
				"Если такой email существует, ссылка для сброса уже отправлена.",
			);
			setRequestValues({ email: "" });
		} catch (fetchError) {
			const message =
				fetchError instanceof Error
					? fetchError.message
					: "Не удалось отправить письмо для сброса пароля.";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	};

	const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!token) {
			toast.error("Токен сброса пароля не найден.");
			return;
		}

		if (resetValues.newPassword !== resetValues.confirmPassword) {
			toast.error("Пароли не совпадают.");
			return;
		}

		setIsPending(true);

		try {
			await authClient.$fetch("/reset-password", {
				method: "POST",
				body: {
					token,
					newPassword: resetValues.newPassword,
				},
			});

			toast.success("Пароль обновлен. Теперь можно войти в аккаунт.");
			router.replace("/signIn");
		} catch (fetchError) {
			const message =
				fetchError instanceof Error
					? fetchError.message
					: "Не удалось обновить пароль.";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	};

	return {
		error,
		isPending,
		isResetMode,
		requestValues,
		resetValues,
		handleRequestChange,
		handleRequestReset,
		handleResetChange,
		handleResetPassword,
	};
}
