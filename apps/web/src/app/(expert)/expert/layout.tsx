import type { ReactNode } from "react";
import CreateScriptButton from "./_components/createScriptButton";

export default function Layout({
	draftScripts,
	completeScripts,
	reports,
}: Readonly<{
	draftScripts: ReactNode;
	completeScripts: ReactNode;
	reports: ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl px-6 py-16">
				<div className="mb-12 flex items-center justify-between">
					<h1 className="font-bold text-3xl">Рабочий кабинет эксперта</h1>
				</div>

				<section className="mb-12">
					<div className="mb-4 flex items-center justify-between">
						<CreateScriptButton />
					</div>
					<h2 className="mb-4 font-semibold text-xl">Мои черновики</h2>
					{draftScripts}
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-xl">Мои сценарии</h2>
					{completeScripts}
				</section>

				<section className="mt-12">
					<h2 className="mb-4 font-semibold text-xl">Жалобы на мои курсы</h2>
					{reports}
				</section>
			</main>
		</div>
	);
}
