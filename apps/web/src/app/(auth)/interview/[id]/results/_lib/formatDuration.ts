export function formatDuration(startedAt: Date, finishedAt: Date | null) {
	if (!finishedAt) return "—";

	const totalMinutes = Math.max(
		1,
		Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000),
	);

	if (totalMinutes < 60) {
		return `${totalMinutes} мин`;
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (minutes === 0) {
		return `${hours} ч`;
	}

	return `${hours} ч ${minutes} мин`;
}
