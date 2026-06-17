import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AchievementForm } from "../(table)/_components/achievementForm";

export default function NewAchievementPage() {
	return (
		<div className="mx-auto max-w-4xl space-y-8">
			<div className="flex items-start gap-4">
				<Button variant="outline" size="icon" asChild className="mt-1 shrink-0">
					<Link href="/admin/achievements">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">
						Новое достижение
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						Создайте формулу достижения — как только пользователь выполнит
						условия, награда будет выдана автоматически.
					</p>
				</div>
			</div>

			<Separator />

			<AchievementForm className="grid gap-8 lg:grid-cols-[1fr_320px]" />
		</div>
	);
}
