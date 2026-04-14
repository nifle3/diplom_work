"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordForm } from "../_hooks/useForgotPasswordForm";

export default function ForgotPasswordForm() {
	const { isPending, requestEmail, setRequestEmail, handleRequestReset } =
		useForgotPasswordForm();

	return (
		<form className="space-y-4" noValidate onSubmit={handleRequestReset}>
			<div>
				<Label className="mb-2" htmlFor="email">
					Email
				</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					value={requestEmail}
					onChange={(e) => setRequestEmail(e.target.value)}
					placeholder="you@example.com"
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Отправляем..." : "Отправить ссылку"}
			</Button>
		</form>
	);
}
