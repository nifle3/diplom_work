import type { ReactNode } from "react";

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-bold text-2xl">Жалобы на курсы</h1>
				<p className="text-muted-foreground">
					Все обращения пользователей по конкретным сценариям.
				</p>
			</div>
			{children}
		</div>
	);
}
