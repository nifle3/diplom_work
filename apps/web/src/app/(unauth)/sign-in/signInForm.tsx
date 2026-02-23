"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function SignInForm() {
    const router = useRouter();
    const [values, setValues] = useState({ email: "", password: "" });
    const login = useMutation(
        trpc.auth.login.mutationOptions({
        onSuccess: () => {
            router.push("/dashboard");
        },
        onError(error) {
            toast.error(error.message ?? "Не удалось войти");
        },
        })
    );

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        login.mutate(values);
    };

    const handleChange = (field: "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
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
            <label className="block text-sm mb-1" htmlFor="password">
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

          {login.error && (
            <p className="text-sm text-red-600">{login.error.message}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={login.isPending}
            >
              {login.isPending ? "Входим..." : "Войти"}
            </button>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Забыли пароль?
            </Link>
          </div>
        </form>
    )
}