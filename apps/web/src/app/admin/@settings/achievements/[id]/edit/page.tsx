import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { serverTrpc } from "@/lib/trpcServer";
import { AchievementForm } from "../../(table)/_components/achievementForm";

export default async function EditAchievementPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();

	let achievement: Awaited<ReturnType<typeof trpcCaller.achievement.getById>>;
	try {
		achievement = await trpcCaller.achievement.getById(id);
	} catch {
		notFound();
	}

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
						Редактировать достижение
					</h1>
					<p className="max-w-2xl text-muted-foreground">{achievement.name}</p>
				</div>
			</div>

			<Separator />

			<AchievementForm
				achievement={achievement}
				className="grid gap-8 lg:grid-cols-[1fr_320px]"
			/>
		</div>
	);
}
