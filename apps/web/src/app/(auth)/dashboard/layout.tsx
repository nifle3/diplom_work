import type { ReactNode } from "react";

export default function Layout({
	info,
	lastActivity,
	lastCourse,
}: Readonly<{
	info: ReactNode;
	lastActivity: ReactNode;
	lastCourse: ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl px-6 py-16">
				<div className="mb-12 flex items-center justify-between">{info}</div>

				<section className="mb-16">
					<h2 className="mb-4 font-semibold text-xl">Последняя активность</h2>
					{lastActivity}
				</section>

				<section>
					<h2 className="mb-6 font-semibold text-xl">Новые курсы</h2>
					{lastCourse}
				</section>
			</main>
		</div>
	);
}
