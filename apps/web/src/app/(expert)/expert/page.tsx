import type { Metadata } from "next";

import { serverTrpc } from "@/lib/trpcServer";
import CreateScriptButton from "./_components/createScriptButton";
import {
	type ScriptRow,
	SharedScriptsTable,
} from "./_components/sharedScriptsTable";

export const metadata: Metadata = {
	title: "Рабочий кабинет эксперта",
};

export default async function ExpertPage() {
	const trpc = await serverTrpc();

	const [scripts, drafts] = await Promise.all([
		trpc.expert.getMyScripts(),
		trpc.expert.getMyDrafts(),
	]);

	const scriptsData: ScriptRow[] = scripts.map((s) => ({
		id: s.id,
		title: s.title,
		context: s.context,
		categoryName: s.categoryName,
		createdAt: s.createdAt,
	}));

	const draftsData: ScriptRow[] = drafts.map((d) => ({
		id: d.id,
		title: d.title,
		context: d.context,
		categoryName: d.categoryName,
		createdAt: d.createdAt,
	}));

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
					<SharedScriptsTable data={draftsData} isDraftTable={true} />
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-xl">Мои сценарии</h2>
					<SharedScriptsTable data={scriptsData} />
				</section>
			</main>
		</div>
	);
}
