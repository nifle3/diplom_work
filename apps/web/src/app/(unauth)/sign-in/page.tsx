import Link from "next/link";
import type { Metadata } from "next";

import SignInForm from "./signInForm";

export const metadata: Metadata = {
  title: "Войти в аккаунт",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Войти в аккаунт</h1>
        <SignInForm/>
        <p className="mt-6 text-center text-sm">
          Нет аккаунта?
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
