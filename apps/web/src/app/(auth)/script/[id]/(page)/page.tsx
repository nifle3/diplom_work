import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/assetUrl";
import { serverTrpc } from "@/lib/trpcServer";
import NewSessionButton from "./_components/newSessionButton";
import { ReportScriptButton } from "./_components/reportScriptButton";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.script.getInfo(id);

	const imageSrc = getAssetUrl(data.image);
	const description =
		data.description?.trim() || "Описание курса пока не добавлено.";
	const shortDescription =
		description.length > 100
			? `${description.slice(0, 100).trimEnd()}…`
			: description;
	const createdAt = data.draftOverAt
		? data.draftOverAt.toLocaleDateString("ru-RU", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			})
		: "Не указана";

	return (
		<Card className="overflow-hidden border-border/60 bg-background/95 shadow-slate-950/5 shadow-xl">
			<div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
				<div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_30%)]" />
					<div className="relative flex h-full flex-col gap-8">
						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary" className="bg-sky-100 text-sky-900">
								{data.category?.name ?? "Без категории"}
							</Badge>
							<Badge variant="outline" className="bg-background/80">
								Дата создания: {createdAt}
							</Badge>
						</div>

						<div className="min-w-0 space-y-4">
							<h1 className="max-w-3xl break-words font-semibold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
								{data.title}
							</h1>
							<p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
								Описание курса
							</p>
							{description.length > 100 ? (
								<details className="group max-w-3xl">
									<summary className="cursor-pointer list-none font-medium text-sky-700 text-sm underline-offset-4 hover:underline">
										<span className="group-open:hidden">
											Показать полностью
										</span>
										<span className="hidden group-open:inline">
											Скрыть описание
										</span>
									</summary>
									<p className="mt-3 whitespace-pre-wrap break-words text-base text-muted-foreground leading-7 [overflow-wrap:anywhere] group-open:hidden sm:text-lg">
										{shortDescription}
									</p>
									<p className="mt-3 hidden whitespace-pre-wrap break-words text-base text-muted-foreground leading-7 [overflow-wrap:anywhere] group-open:block sm:text-lg">
										{description}
									</p>
								</details>
							) : (
								<p className="max-w-3xl whitespace-pre-wrap break-words text-base text-muted-foreground leading-7 [overflow-wrap:anywhere] sm:text-lg">
									{description}
								</p>
							)}
							<div className="flex flex-col gap-3 pt-2 sm:flex-row">
								<NewSessionButton scriptId={id} />
								<ReportScriptButton scriptId={id} />
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-2xl border border-border/60 bg-background/70 p-4">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
									Дата создания
								</p>
								<p className="mt-2 font-medium text-sm">{createdAt}</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-background/70 p-4">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
									Категория
								</p>
								<p className="mt-2 font-medium text-sm">
									{data.category?.name ?? "Не указана"}
								</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-background/70 p-4">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
									Автор
								</p>
								<p className="mt-2 font-medium text-sm">
									{data.expert?.name ?? "Неизвестно"}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="relative h-[280px] self-start overflow-hidden border-border/60 border-t lg:aspect-[4/3] lg:h-auto lg:border-t-0 lg:border-l">
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={data.title}
							fill
							className="object-cover"
							sizes="(min-width: 1024px) 38vw, 100vw"
							priority
							unoptimized
						/>
					) : (
						<div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500" />
					)}
				</div>
			</div>
		</Card>
	);
}
