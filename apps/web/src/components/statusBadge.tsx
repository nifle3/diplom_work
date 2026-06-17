import { Badge } from "@/components/ui/badge";
import { type ReportStatus, statusMeta } from "@/lib/reportStatus";

type StatusBadgeProps = {
	status: ReportStatus;
	iconOnly?: boolean;
	className?: string;
};

export function StatusBadge({ status, iconOnly, className }: StatusBadgeProps) {
	const meta = statusMeta[status];
	const Icon = meta.icon;

	if (iconOnly) {
		return (
			<div
				className={`flex items-center justify-center rounded-full border ${meta.className} ${className ?? ""}`}
			>
				<Icon className="size-3.5" />
			</div>
		);
	}

	return (
		<Badge
			variant="outline"
			className={`gap-1.5 ${meta.className} ${className ?? ""}`}
		>
			<Icon className="size-3.5" />
			{meta.label}
		</Badge>
	);
}
