"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/header";
import { trpc } from "@/utils/trpc";

export default function SignInPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError(error: Error) {
      toast.error(error.message ?? "Не удалось войти");
    },
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    login.mutate(values);
  };

  const handleChange = (field: "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Войти в аккаунт</h1>
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
              disabled={login.isLoading}
            >
              {login.isLoading ? "Входим..." : "Войти"}
            </button>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Забыли пароль?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm">
          Нет аккаунта?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
