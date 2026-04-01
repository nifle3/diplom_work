import { Flag } from "lucide-react";

export function EmptyReports() {
	return (
		<div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Flag className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="mb-1 font-semibold text-lg">Нет жалоб</h3>
			<p className="text-muted-foreground text-sm">
				Если вы отправите жалобу на курс, она появится здесь вместе со статусом
				рассмотрения.
			</p>
		</div>
	);
}
