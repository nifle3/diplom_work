import type { ReactNode } from "react";

export default function Layout({
	children,
	myHistory,
}: Readonly<{
	children: ReactNode;
	myHistory: ReactNode;
}>) {
	return (
		<div className="bg-gradient-to-b from-background via-background to-muted/30">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
				<section className="space-y-6">{children}</section>

				<section className="space-y-4">
					<div className="flex flex-col gap-1">
						<p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
							История
						</p>
						<h2 className="font-semibold text-2xl tracking-tight">
							История прохождений
						</h2>
					</div>

					{myHistory}
				</section>
			</div>
		</div>
	);
}
