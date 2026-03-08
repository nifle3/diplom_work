import { ArrowLeft, MessageSquare, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { serverTrpc } from "@/lib/trpcServer";

export const metadata = {
	title: "Результаты интервью",
};

interface ResultsPageProps {
	searchParams: Promise<{ sessionId?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
	const params = await searchParams;
	const sessionId = params.sessionId;

	if (!sessionId) {
		redirect("/scripts");
	}

	const trpc = await serverTrpc();

	let sessionData: any;
	try {
		sessionData = await trpc.interview.getSession({ sessionId });
	} catch (_error) {
		redirect("/scripts");
	}

	const { session, messages } = sessionData;

	const feedbacks = messages
		.filter((msg) => msg.isAi && msg.analysisNote)
		.map((msg) => {
			const note = msg.analysisNote;
			const feedbackMatch = note?.match(/FEEDBACK:\s*(.+?)(?=\nSCORE:|$)/s);
			const scoreMatch = note?.match(/SCORE:\s*(\d+)/);
			return {
				feedback: feedbackMatch ? feedbackMatch[1].trim() : "",
				score: scoreMatch ? Number.parseInt(scoreMatch[1], 10) : null,
			};
		})
		.filter((item) => item.feedback || item.score !== null);

	const scorePercent = Math.round(session.finalScore * 10); // Convert to percentage
	const xpGained = Math.round(session.finalScore * 10); // Same calculation as in finishSession

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl space-y-10 px-6 py-16">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">Результаты интервью</h1>
					<Link href="/scripts">
						<Button variant="outline" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />К сценариям
						</Button>
					</Link>
				</div>

				<div className="mb-6 text-center">
					<h2 className="font-semibold text-gray-600 text-xl dark:text-gray-400">
						{session.scenarioTitle}
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Card className="flex flex-col items-center justify-center text-center">
						<CardHeader>
							<Trophy className="size-6 text-yellow-500" />
							<CardTitle className="mt-2">Оценка</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="font-extrabold text-5xl text-blue-600">
								{scorePercent}%
							</div>
							<div className="mt-2 text-gray-600 text-sm dark:text-gray-400">
								Средний балл: {session.finalScore.toFixed(1)}/10
							</div>
							<div className="mt-4 w-full">
								<ProgressBar percent={scorePercent} />
							</div>
						</CardContent>
					</Card>

					<Card className="flex flex-col items-center justify-center text-center">
						<CardHeader>
							<Star className="size-6 text-yellow-400" />
							<CardTitle className="mt-2">Получено опыта</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-4xl text-green-600">
								+{xpGained} XP
							</div>
						</CardContent>
					</Card>
				</div>

				{feedbacks.length > 0 && (
					<Card>
						<CardHeader>
							<MessageSquare className="size-5" />
							<CardTitle className="ml-2">Обратная связь</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{feedbacks.map((item) => (
								<div
									key={item.feedback}
									className="border-blue-500 border-l-4 pl-4"
								>
									{item.feedback && (
										<p className="mb-2 text-foreground/90 text-sm leading-relaxed">
											{item.feedback}
										</p>
									)}
									{item.score !== null && (
										<div className="text-gray-600 text-xs dark:text-gray-400">
											Оценка: {item.score}/10
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				)}

				<div className="flex justify-center gap-4">
					<Link href={`/interview?scenario=${session.scenarioId}`}>
						<Button variant="outline" size="sm">
							Пройти ещё раз
						</Button>
					</Link>
					<Link href="/dashboard">
						<Button size="sm">На дашборд</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
