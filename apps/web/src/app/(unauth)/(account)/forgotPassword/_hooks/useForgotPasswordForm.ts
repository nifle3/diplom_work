"use client";

import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { getAuthErrorMessage } from "@/lib/authMessages";

export function useForgotPasswordForm() {
	const [isPending, setIsPending] = useState(false);
	const [requestEmail, setRequestEmail] = useState<string>("");

	const handleRequestReset = async (event: SubmitEvent) => {
		event.preventDefault();

		if (!requestEmail.trim()) {
			toast.error("Введите email.");
			return;
		}

		setIsPending(true);

		try {
			await authClient.requestPasswordReset({
				email: requestEmail,
				redirectTo: `${window.location.origin}/resetPassword`,
			});

			toast.success(
				"Если такой email существует, ссылка для сброса уже отправлена.",
			);

			setRequestEmail("");
		} catch (fetchError) {
			toast.error(
				getAuthErrorMessage(
					fetchError,
					"Не удалось отправить письмо для сброса пароля.",
				),
			);
		} finally {
			setIsPending(false);
		}
	};

	return {
		isPending,
		requestEmail,
		setRequestEmail,
		handleRequestReset,
	};
}
