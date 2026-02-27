import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "AI Master interview",
};

export default function NonAuthDashboardPage() {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl px-6 py-16 text-center">
				<h1 className="mb-4 font-extrabold text-4xl">Interview Master AI</h1>
				<p className="mb-6 text-lg text-muted-foreground">
					Подготовьтесь к собеседованию с помощью интерактивного ИИ: симулируйте
					реальные интервью, получайте подробную обратную связь от экспертных
					сценариев и улучшайте навыки шаг за шагом.
				</p>

				<div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/sign-in"
						className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
					>
						Войти
					</Link>
					<Link
						href="/sign-up"
						className="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
					>
						Зарегистрироваться
					</Link>
				</div>

				<section className="rounded-lg bg-gray-50 p-6 text-left shadow-sm dark:bg-gray-900">
					<h2 className="mb-3 font-semibold text-2xl">Что внутри</h2>
					<ul className="list-disc space-y-2 pl-5 text-base">
						<li>
							Динамическая генерация вопросов, похожих на реальные интервью.
						</li>
						<li>Настраиваемые сценарии и критерии от экспертов HR.</li>
						<li>Мгновенный анализ ответов и развернутые отчёты.</li>
						<li>Геймификация: стрики, достижения и прогресс XP.</li>
					</ul>
				</section>
			</main>
		</div>
	);
}
