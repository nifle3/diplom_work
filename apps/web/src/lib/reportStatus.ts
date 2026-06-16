import { CheckCircle2, Clock3, type LucideIcon, ShieldAlert } from "lucide-react";

export const reportStatuses = [
	"new",
	"in_review",
	"resolved",
	"rejected",
] as const;

export type ReportStatus = (typeof reportStatuses)[number];

export const statusMeta: Record<
	ReportStatus,
	{ label: string; icon: LucideIcon; className: string }
> = {
	new: {
		label: "Новая",
		icon: ShieldAlert,
		className:
			"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
	},
	in_review: {
		label: "На проверке",
		icon: Clock3,
		className:
			"border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
	},
	resolved: {
		label: "Решено",
		icon: CheckCircle2,
		className:
			"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
	},
	rejected: {
		label: "Отклонено",
		icon: ShieldAlert,
		className:
			"border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
	},
};
