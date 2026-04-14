"use client";

import Link from "next/link";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { getAuthErrorMessage } from "@/lib/authMessages";

export default function SignInForm() {
	const [isPending, setIsPending] = useState(false);
	const [values, setValues] = useState({ email: "", password: "" });

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!values.email.trim()) {
			toast.error("Введите email.");
			return;
		}

		if (!values.password) {
			toast.error("Введите пароль.");
			return;
		}

		await authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onSuccess: () => {
					window.location.href = "/dashboard";
				},
				onError: (ctx) => {
					toast.error(getAuthErrorMessage(ctx.error, "Не удалось войти."));
				},
				onRequest: () => {
					setIsPending(true);
				},
				onResponse: () => {
					setIsPending(false);
				},
			},
		);
	};

	const handleChange =
		(field: "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
			setValues((prev) => ({ ...prev, [field]: event.target.value }));
		};

	return (
		<form className="space-y-4" noValidate onSubmit={handleSubmit}>
			<div>
				<label className="mb-1 block text-sm" htmlFor="email">
					Email
				</label>
				<input
					id="email"
					name="email"
					required
					value={values.email}
					onChange={handleChange("email")}
					className="w-full rounded-md border px-3 py-2"
					type="email"
					autoComplete="email"
				/>
			</div>

			<div>
				<label className="mb-1 block text-sm" htmlFor="password">
					Пароль
				</label>
				<input
					id="password"
					name="password"
					required
					value={values.password}
					onChange={handleChange("password")}
					className="w-full rounded-md border px-3 py-2"
					type="password"
					autoComplete="current-password"
				/>
			</div>
			<div className="flex items-center justify-between">
				<Button
					type="submit"
					className="rounded-md bg-blue-600 px-4 py-2 text-white"
					disabled={isPending}
				>
					{isPending ? "Входим..." : "Войти"}
				</Button>
				<Link
					href={{ pathname: "/forgotPassword" }}
					className="text-blue-600 text-sm hover:underline"
				>
					Забыли пароль?
				</Link>
			</div>
		</form>
	);
}
