export type DateFormatOptions = Intl.DateTimeFormatOptions;

const DEFAULT_OPTIONS: DateFormatOptions = {
	day: "2-digit",
	month: "short",
	year: "numeric",
};

export function formatDate(
	date: Date | string | number | null | undefined,
	options: DateFormatOptions = DEFAULT_OPTIONS,
	locale = "ru-RU",
) {
	if (!date) return "—";

	try {
		const d =
			typeof date === "string" || typeof date === "number"
				? new Date(date)
				: date;

		if (Number.isNaN(d.getTime())) return "—";

		return new Intl.DateTimeFormat(locale, options).format(d);
	} catch (error) {
		console.error("Error formatting date:", error);
		return "—";
	}
}

export const datePresets = {
	short: {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	} as DateFormatOptions,
	medium: {
		day: "2-digit",
		month: "short",
		year: "numeric",
	} as DateFormatOptions,
	long: {
		day: "numeric",
		month: "long",
		year: "numeric",
	} as DateFormatOptions,
	dateTime: {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as DateFormatOptions,
	fullDateTime: {
		dateStyle: "long",
		timeStyle: "short",
	} as DateFormatOptions,
};
