export function formatDate(date: Date | null) {
	if (!date) return "—";

	return new Intl.DateTimeFormat("ru-RU", {
		dateStyle: "long",
		timeStyle: "short",
	}).format(date);
}
