"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordForm } from "../_hooks/useResetPasswordForm";

type ResetFormParams = {
	token: string;
};

export function ResetForm({ token }: ResetFormParams) {
	const {
		password,
		setPassword,
		repeatPassword,
		setRepeatPassword,
		isPending,
		onCallbackQuery,
	} = useResetPasswordForm(token);

	return (
		<form className="space-y-4" onSubmit={onCallbackQuery}>
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
					value={password}
					onChange={(e) => setPassword(e.target.value)}
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
					value={repeatPassword}
					onChange={(e) => setRepeatPassword(e.target.value)}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Сохраняем..." : "Сохранить новый пароль"}
			</Button>
		</form>
	);
}
