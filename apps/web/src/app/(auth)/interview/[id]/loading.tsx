import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
			<Spinner className="size-6" />
		</div>
	);
}
