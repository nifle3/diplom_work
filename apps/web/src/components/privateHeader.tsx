import Link from "next/link";

import { ThemeToggle } from "./themeToggle";
import UserMenu from "./user-menu";

export default function PrivateHeader() {
  const links = [
    { to: "/dashboard", label: "Dashboard" },
      { to: "/expert", label: "Кабинет эксперта" },
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
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </header>
  );
}
