import Link from "next/link";
import { Button } from "@/components/ui/button";

export function InvalidLink() {
	return (
		<div className="space-y-4">
			<p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
				Ссылка для сброса недействительна или уже истекла.
			</p>
			<Button asChild variant="outline" className="w-full">
				<Link href="/forgotPassword">Запросить новую ссылку</Link>
			</Button>
		</div>
	);
}
