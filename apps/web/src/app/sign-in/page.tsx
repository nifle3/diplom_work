"use client";
import Link from "next/link";
import Header from "../../components/header";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Войти в аккаунт</h1>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full rounded-md border px-3 py-2" type="email" />
          </div>

          <div>
            <label className="block text-sm mb-1">Пароль</label>
            <input className="w-full rounded-md border px-3 py-2" type="password" />
          </div>

          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Войти</button>
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
