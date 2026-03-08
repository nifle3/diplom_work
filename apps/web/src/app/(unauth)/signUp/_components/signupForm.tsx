"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";

export default function SignUpForm() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [values, setValues] = useState({ name: "", email: "", password: "" });

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		await authClient.signUp.email(
			{
				name: values.name,
				email: values.email,
				password: values.password,
			},
			{
				onSuccess() {
					router.push("/signIn" as Route);
				},
				onError(ctx) {
					toast.error(ctx.error.message);
				},
				onRequest() {
					setIsPending(true);
				},
				onResponse() {
					setIsPending(false);
				},
			},
		);
	};

	const handleChange =
		(field: "name" | "email" | "password") =>
		(event: ChangeEvent<HTMLInputElement>) => {
			setValues((prev) => ({ ...prev, [field]: event.target.value }));
		};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<label className="mb-1 block text-sm" htmlFor="name">
					Имя
				</label>
				<input
					id="name"
					name="name"
					required
					value={values.name}
					onChange={handleChange("name")}
					className="w-full rounded-md border px-3 py-2"
					type="text"
					autoComplete="name"
				/>
			</div>
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
					minLength={8}
					value={values.password}
					onChange={handleChange("password")}
					className="w-full rounded-md border px-3 py-2"
					type="password"
					autoComplete="new-password"
				/>
			</div>
			<div className="flex items-center justify-between">
				<Button
					type="submit"
					className="rounded-md bg-green-600` px-4 py-2 text-white"
					disabled={isPending}
				>
					{isPending ? "Создаём..." : "Зарегистрироваться"}
				</Button>
			</div>
		</form>
	);
}
