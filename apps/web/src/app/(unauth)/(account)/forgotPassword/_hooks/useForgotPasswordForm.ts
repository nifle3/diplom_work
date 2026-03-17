"use client";

import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";

export function useForgotPasswordForm() {
	const [isPending, setIsPending] = useState(false);
	const [requestEmail, setRequestEmail] = useState<string>("");

	const handleRequestReset = async (event: SubmitEvent) => {
		event.preventDefault();
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
			const message =
				fetchError instanceof Error
					? fetchError.message
					: "Не удалось отправить письмо для сброса пароля.";
			toast.error(message);
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
