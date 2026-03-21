import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export default function Layout({
	children,
	bottom,
	stats,
}: Readonly<{
	children: ReactNode;
	bottom: ReactNode;
	stats: ReactNode;
}>) {
	return (
		<>
			{children}

			<div className="mt-8 grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">{stats}</div>
			</div>

			<div className="mt-8 flex items-center gap-4 border-b pb-4">
				<h2 className="font-semibold text-lg">Выберите раздел:</h2>
				<div className="flex gap-2">
					<Link href={{ pathname: "/profile/my/history" }} passHref>
						<Button
							variant="ghost"
							className="rounded-full hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white"
						>
							📜 История
						</Button>
					</Link>
					<Link href={{ pathname: "/profile/my/achievements" }} passHref>
						<Button
							variant="ghost"
							className="rounded-full hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white"
						>
							🏆 Достижения
						</Button>
					</Link>
				</div>
			</div>

			<div className="mt-10">{bottom}</div>
		</>
	);
}
