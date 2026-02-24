import Link from "next/link";

import { ThemeToggle } from "./themeToggle";

export default function PublicHeader() {
  return (
    <header className="bg-transparent">
      <div className="flex flex-row items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-semibold">
            Interview Master AI
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-100"
          >
            Войти
          </Link>
          <Link
            href="/sign-up"
            className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
      <hr />
    </header>
  );
}