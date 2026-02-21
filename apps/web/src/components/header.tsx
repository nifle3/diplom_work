"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";

import { ModeToggle } from "./mode-toggle";

// public header shown to unauthenticated visitors
export function PublicHeader() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <header className="bg-transparent">
      <div className="flex flex-row items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-semibold">
            Interview Master AI
          </Link>
          <nav className="hidden sm:flex gap-4 text-lg items-center">
            {links.map(({ to, label }) => (
              <Link key={to} href={to} className="hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
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

// private header for authenticated users
export function PrivateHeader() {
  const links = [
    { to: "/dashboard", label: "Dashboard" },
      { to: "/expert", label: "Кабинет эксперта" },
    // other authenticated links can go here
  ] as const;

  // redirect if not logged in
  const { data: session, isPending } = authClient.useSession();
  const router = require("next/navigation").useRouter();
  if (!isPending && !session) {
    router.push("/sign-in");
    return null;
  }

  return (
    <header className="bg-transparent">
      <div className="flex flex-row items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-semibold">
            Interview Master AI
          </Link>
          <nav className="hidden sm:flex gap-4 text-lg items-center">
            {links.map(({ to, label }) => (
              <Link key={to} href={to} className="hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </header>
  );
}

// default export remains PublicHeader for backwards compatibility
export default PublicHeader;
