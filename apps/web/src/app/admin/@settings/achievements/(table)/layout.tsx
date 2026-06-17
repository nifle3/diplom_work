import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Достижения</h1>
					<p className="text-muted-foreground">
						Создавайте формулы, чтобы награды выдавались автоматически по
						данным пользователя.
					</p>
				</div>

				<Button asChild variant="default">
					<Link href="/admin/achievements/new">
						<Plus className="mr-2 h-4 w-4" />
						Создать достижение
					</Link>
				</Button>
			</div>

			{children}
		</div>
	);
}
