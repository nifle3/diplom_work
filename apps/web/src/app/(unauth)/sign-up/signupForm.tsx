"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react"; 
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function SignUpForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const register = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError(error) {
        toast.error(error.message ?? "Не удалось создать аккаунт");
      },
    })
  );
  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    register.mutate(values);
  };
  const handleChange = (field: "name" | "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1" htmlFor="name">
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
          minLength={8}
          value={values.password}
          onChange={handleChange("password")}
          className="w-full rounded-md border px-3 py-2"
          type="password"
          autoComplete="new-password"
        />
      </div>
      {register.error && (
        <p className="text-sm text-red-600">{register.error.message}</p>
      )}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md"
          disabled={register.isPending}
        >
          {register.isPending ? "Создаём..." : "Зарегистрироваться"}
        </button>
      </div>
    </form>
  );
}