import Link from "next/link";

import { serverTrpc } from "@/lib/trpcServer";

import { ThemeToggle } from "./themeToggle";
import UserMenu from "./userMenu";

type PrivateHeaderProps = {
	role: string;
};

export default async function PrivateHeader({ role }: Readonly<PrivateHeaderProps>) {
	return (
		<header className="bg-transparent">
			<div className="mx-auto flex max-w-6xl flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-6">
					<Link href="/" className="font-semibold text-2xl">
						Interview Master AI
					</Link>
					<nav className="hidden items-center gap-4 text-lg sm:flex">
						<Link href={{ pathname: "/dashboard" }} className="hover:underline">
							Главная страница
						</Link>

						<Link href={{ pathname: "/scripts" }} className="hover:underline">
							Все курсы
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />
					<UserMenu role={role}/>
				</div>
			</div>
			<hr />
		</header>
	);
}
