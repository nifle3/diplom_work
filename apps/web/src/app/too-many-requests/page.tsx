import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Слишком много запросов",
};

export default function TooManyRequestsPage() {
	return (
		<div className="flex min-h-[calc(100svh-57px)] items-center justify-center px-6 py-16">
			<main className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
				<p className="mb-3 font-medium text-muted-foreground text-sm">Ошибка 429</p>
				<h1 className="mb-4 font-semibold text-3xl">
					Слишком много запросов
				</h1>
				<p className="mb-8 text-muted-foreground">
					Вы слишком часто открываете страницы. Подождите немного и попробуйте
					снова.
				</p>
				<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link
						href="/"
						className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground"
					>
						На главную
					</Link>
				</div>
			</main>
		</div>
	);
}
