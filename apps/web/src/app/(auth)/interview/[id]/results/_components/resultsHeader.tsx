import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ResultsHeaderProps = {
	backHref: Route;
	description?: string | null;
	scoreLabel: string;
	scoreBadgeClassName: string;
	title?: string | null;
};

export function ResultsHeader({
	backHref,
	description,
	scoreLabel,
	scoreBadgeClassName,
	title,
}: ResultsHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-2">
				<Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
					<Link href={backHref}>
						<ChevronLeft className="size-4" />К сценарию
					</Link>
				</Button>

				<div className="space-y-1">
					<p className="text-muted-foreground text-sm">
						Итог прохождения интервью
					</p>
					<h1 className="font-semibold text-3xl tracking-tight">
						{title ?? "Результат интервью"}
					</h1>

					{description ? (
						<p className="max-w-3xl text-muted-foreground text-sm leading-6">
							{description}
						</p>
					) : null}
				</div>
			</div>

			<Badge className={scoreBadgeClassName}>{scoreLabel}</Badge>
		</div>
	);
}
