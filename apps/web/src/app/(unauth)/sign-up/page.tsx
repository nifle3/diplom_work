import Link from "next/link";
import type { Metadata } from "next";

import SignUpForm from "./signupForm";

export const metadata: Metadata = {
  title: "Создать аккаунт",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Создать аккаунт</h1>
        <SignUpForm />
        <p className="mt-6 text-center text-sm">
          Уже есть аккаунт?
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}