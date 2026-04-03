import type { Route } from "next";
import { redirect } from "next/navigation";
import { getScoreTone } from "@/lib/score";
import { serverTrpc } from "@/lib/trpcServer";
import { QuestionsSection } from "./_components/questionsSection";
import { ResultsHeader } from "./_components/resultsHeader";
import { ScoreOverviewCard } from "./_components/scoreOverviewCard";
import { SummaryCard } from "./_components/summaryCard";
import { getBackHref } from "./_lib/getBackHref";

export const metadata = {
	title: "Результаты интервью",
};

export default async function ResultsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();
	const result = await trpcCaller.session.getResultBySessionId(id);

	if (
		result.status?.name !== "complete" &&
		result.status?.name !== "canceled"
	) {
		redirect(`/interview/${id}`);
	}

	const backHref = getBackHref(result.script?.id);
	const scoreTone = getScoreTone(result.finalScore);
	const scoreLabel =
		result.status?.name === "canceled" ? "Отменено" : scoreTone.label;
	const answeredQuestions = result.questions.filter((item) =>
		item.answer?.trim(),
	);

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent_35%)] px-4 py-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<ResultsHeader
					backHref={backHref as Route}
					description={result.script?.description}
					scoreLabel={scoreLabel}
					scoreBadgeClassName={scoreTone.badgeClassName}
					title={result.script?.title}
				/>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
					<ScoreOverviewCard
						answeredCount={answeredQuestions.length}
						expertFeedback={result.expertFeedback}
						experienceGained={result.experienceGained}
						finalScore={result.finalScore}
						finishedAt={result.finishedAt ?? null}
						scoreTone={scoreTone}
						startedAt={result.startedAt ?? null}
					/>

					<SummaryCard
						expertFeedback={result.expertFeedback}
						startedAt={result.startedAt ?? null}
					/>
				</div>

				<QuestionsSection questions={answeredQuestions} />
			</div>
		</div>
	);
}
