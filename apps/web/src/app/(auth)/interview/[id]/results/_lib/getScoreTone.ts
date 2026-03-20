export function getScoreTone(score: number | null) {
	if (score === null) {
		return {
			badgeClassName:
				"border-border bg-muted text-muted-foreground shadow-none",
			ringClassName: "from-border via-border/70 to-transparent",
			textClassName: "text-muted-foreground",
			label: "Нет оценки",
		};
	}

	if (score >= 80) {
		return {
			badgeClassName:
				"border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
			ringClassName:
				"from-emerald-400 via-emerald-300/60 to-transparent dark:from-emerald-500 dark:via-emerald-400/40",
			textClassName: "text-emerald-700 dark:text-emerald-300",
			label: "Сильный результат",
		};
	}

	if (score >= 60) {
		return {
			badgeClassName:
				"border-amber-200 bg-amber-50 text-amber-700 shadow-none dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
			ringClassName:
				"from-amber-400 via-amber-300/60 to-transparent dark:from-amber-500 dark:via-amber-400/40",
			textClassName: "text-amber-700 dark:text-amber-300",
			label: "Хорошая база",
		};
	}

	return {
		badgeClassName:
			"border-rose-200 bg-rose-50 text-rose-700 shadow-none dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
		ringClassName:
			"from-rose-400 via-rose-300/60 to-transparent dark:from-rose-500 dark:via-rose-400/40",
		textClassName: "text-rose-700 dark:text-rose-300",
		label: "Есть зоны роста",
	};
}
