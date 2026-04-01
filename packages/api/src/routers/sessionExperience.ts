export function calculateInterviewExperience(finalScore: number | null) {
	if (finalScore === null) {
		return 0;
	}

	return Math.max(0, Math.round(finalScore));
}
