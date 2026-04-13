import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<Card className="overflow-hidden border-border/60 bg-background/95 shadow-slate-950/5 shadow-xl">
			<div className="p-6 sm:p-8">
				<div className="space-y-6">
					<div className="space-y-3">
						<div className="flex gap-2">
							<Skeleton className="h-6 w-28 rounded-full" />
							<Skeleton className="h-6 w-40 rounded-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-full max-w-2xl" />
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Skeleton className="h-36 rounded-2xl" />
						<Skeleton className="h-36 rounded-2xl" />
					</div>
				</div>
			</div>
		</Card>
	);
}
