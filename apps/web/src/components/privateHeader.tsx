import Link from "next/link";

import { ThemeToggle } from "./themeToggle";
import UserMenu from "./userMenu";

type PrivateHeaderProps = {
	role: string;
	email: string;
	username: string;
};

export default async function PrivateHeader({
	role,
	username,
	email,
}: Readonly<PrivateHeaderProps>) {
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
					<UserMenu role={role} username={username} email={email} />
				</div>
			</div>
			<hr />
		</header>
	);
}
