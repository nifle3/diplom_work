"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { getAuthErrorMessage } from "@/lib/authMessages";

export function useResetPasswordForm(token: string) {
	const router = useRouter();
	const { 0: password, 1: setPassword } = useState("");
	const { 0: repeatPassword, 1: setRepeatPassword } = useState("");
	const { 0: isPending, 1: setIsPending } = useState(false);

	const onCallbackQuery = async (e: SubmitEvent) => {
		e.preventDefault();
		if (isPending) {
			return;
		}

		if (password !== repeatPassword) {
			toast("Пароли не совпадают");
			return;
		}

		if (!password) {
			toast("Введите новый пароль");
			return;
		}

		setIsPending(true);

		try {
			await authClient.resetPassword({
				newPassword: password,
				token: token,
			});
			toast("Пароль был измененён");
			router.push("/signIn" as Route);
		} catch (err: unknown) {
			toast(getAuthErrorMessage(err, "Не удалось изменить пароль."));
		} finally {
			setIsPending(false);
		}
	};

	return {
		password,
		setPassword,
		repeatPassword,
		setRepeatPassword,
		isPending,
		onCallbackQuery,
	};
}
