import { Sparkles } from "lucide-react";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-muted">
							<Sparkles className="h-5 w-5 text-muted-foreground" />
						</div>
						<div>
							<h1 className="font-semibold text-2xl">Достижения</h1>
							<p className="text-muted-foreground">
								Создавайте формулы, чтобы награды выдавались автоматически по
								данным пользователя.
							</p>
						</div>
					</div>
				</div>
			</div>

			{children}
		</div>
	);
}
