import Link from "next/link";

import { serverTrpc } from "@/lib/trpcServer";

import { ThemeToggle } from "./themeToggle";
import UserMenu from "./userMenu";

export default async function PrivateHeader() {
	const trpcCaller = await serverTrpc();
	const isUserExpert = await trpcCaller.user.isUserHasRole("expert");
	const isUserAdmin = await trpcCaller.user.isUserHasRole("admin");

	return (
		<header className="bg-transparent">
			<div className="mx-auto flex max-w-6xl flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-6">
					<Link href="/" className="font-semibold text-2xl">
						Interview Master AI
					</Link>
					<nav className="hidden items-center gap-4 text-lg sm:flex">
						<Link href={{ pathname: "/dashboard" }} className="hover:underline">
							Dashboard
						</Link>

						<Link href={{ pathname: "/courses" }} className="hover:underline">
							Все курсы
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />
					<UserMenu isUserAdmin={isUserAdmin} isUserExpert={isUserExpert}/>
				</div>
			</div>
			<hr />
		</header>
	);
}
