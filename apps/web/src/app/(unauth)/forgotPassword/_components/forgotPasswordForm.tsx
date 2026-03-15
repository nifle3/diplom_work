"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordForm } from "../_hooks/useForgotPasswordForm";

export default function ForgotPasswordForm() {
	const {
		error,
		isPending,
		isResetMode,
		requestValues,
		resetValues,
		handleRequestChange,
		handleRequestReset,
		handleResetChange,
		handleResetPassword,
	} = useForgotPasswordForm();

	if (error === "INVALID_TOKEN") {
		return (
			<div className="space-y-4">
				<p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
					Ссылка для сброса недействительна или уже истекла.
				</p>
				<Button asChild variant="outline" className="w-full">
					<Link href="/forgotPassword">Запросить новую ссылку</Link>
				</Button>
			</div>
		);
	}

	if (isResetMode) {
		return (
			<form className="space-y-4" onSubmit={handleResetPassword}>
				<div>
					<Label className="mb-2" htmlFor="newPassword">
						Новый пароль
					</Label>
					<Input
						id="newPassword"
						name="newPassword"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						value={resetValues.newPassword}
						onChange={handleResetChange("newPassword")}
					/>
				</div>

				<div>
					<Label className="mb-2" htmlFor="confirmPassword">
						Повторите пароль
					</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						value={resetValues.confirmPassword}
						onChange={handleResetChange("confirmPassword")}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? "Сохраняем..." : "Сохранить новый пароль"}
				</Button>
			</form>
		);
	}

	return (
		<form className="space-y-4" onSubmit={handleRequestReset}>
			<div>
				<Label className="mb-2" htmlFor="email">
					Email
				</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={requestValues.email}
					onChange={handleRequestChange("email")}
					placeholder="you@example.com"
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Отправляем..." : "Отправить ссылку"}
			</Button>
		</form>
	);
}
