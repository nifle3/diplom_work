import Link from "next/link";

import { ThemeToggle } from "./themeToggle";

export default function PublicHeader() {
	return (
		<header className="bg-transparent">
			<div className="mx-auto flex max-w-6xl flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-6">
					<Link href="/" className="font-semibold text-2xl">
						Interview Master AI
					</Link>
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />
					<Link
						href="/sign-in"
						className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
					>
						Войти
					</Link>
					<Link
						href="/sign-up"
						className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
					>
						Зарегистрироваться
					</Link>
				</div>
			</div>
			<hr />
		</header>
	);
}
