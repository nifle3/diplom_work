import type { Metadata } from "next";

import { serverTrpc } from "@/lib/trpcServer";
import CreateScriptButton from "./createScriptButton";

export const metadata: Metadata = {
	title: "Рабочий кабинет эксперта",
};

export default async function ExpertPage() {
	const trpc = await serverTrpc();

	const { 0: scripts, 1: drafts } = await Promise.all([
		trpc.expert.getMyScripts(),
		trpc.expert.getMyDrafts(),
	]);

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl px-6 py-16">
				<div className="mb-12 flex items-center justify-between">
					<h1 className="font-bold text-3xl">Рабочий кабинет эксперта</h1>
				</div>

				<section className="mb-8">
					<div className="mb-4 flex items-center justify-between">
						<CreateScriptButton />
					</div>
					<h2 className="font-semibold text-xl">Мои черновики</h2>
					{drafts.map((value) => (
						<></>
					))}
					<h2 className="font-semibold text-xl">Мои сценарии</h2>
					{scripts.map((value) => (
						<></>
					))}
				</section>
			</main>
		</div>
	);
}
