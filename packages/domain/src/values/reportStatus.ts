export const reportStatuses = [
	"new",
	"in_review",
	"resolved",
	"rejected",
] as const;

export type ReportStatus = (typeof reportStatuses)[number];
