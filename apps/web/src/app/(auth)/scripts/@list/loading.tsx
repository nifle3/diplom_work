import { Spinner } from "@/components/ui/spinner";

export default function ListLoading() {
	return (
		<div className="flex min-h-100 w-full flex-col items-center justify-center py-20">
			<Spinner className="mb-4" />
			<p className="animate-pulse text-muted-foreground text-sm">
				Загружаем список курсов...
			</p>
		</div>
	);
}
