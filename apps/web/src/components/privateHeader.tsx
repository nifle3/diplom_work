import Link from "next/link";

import { serverTrpc } from "@/utils/trpcServer";

import { ThemeToggle } from "./themeToggle";
import UserMenu from "./user-menu";

export default async function PrivateHeader() {
  const trpcCaller = await serverTrpc();
  const isUserExpert = await trpcCaller.user.isUserHasRole("expert");

  return (
    <header className="bg-transparent">
      <div className="flex flex-row items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-semibold">
            Interview Master AI
          </Link>
          <nav className="hidden sm:flex gap-4 text-lg items-center">
            <Link href={{pathname: "/dashboard"}} className="hover:underline">
              Dashboard
            </Link>
            {isUserExpert && 
              <Link href={{pathname: "/expert"}} className="hover:underline">
                Кабинет эксперта
              </Link>
            }
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
