import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpcServer";
import { SandboxWorkspace } from "./_components/sandboxWorkspace";

export const metadata: Metadata = {
	title: "Sandbox эксперта",
};

type SearchParams = Promise<{
	scriptId?: string;
	sessionId?: string;
}>;

export default async function SandboxPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { scriptId, sessionId } = await searchParams;
	const trpcCaller = await serverTrpc();

	const [publishedScriptsRaw, draftScriptsRaw] = await Promise.all([
		trpcCaller.expert.getMyScripts(),
		trpcCaller.expert.getMyDrafts(),
	]);

	const session = sessionId
		? await trpcCaller.expertSandbox.getSession(sessionId).catch(() => null)
		: null;

	const selectedScript = session
		? {
				id: session.script.id,
				title: session.script.title,
				description: session.script.description,
				context: session.script.context,
			}
		: scriptId
			? await trpcCaller.expert.getFullScript(scriptId).then((script) => ({
					id: script.id,
					title: script.title,
					description: script.description,
					context: script.context,
				})).catch(() => null)
			: null;

	const draftScripts = draftScriptsRaw.map((script) => ({
		...script,
		isDraft: true,
	}));
	const publishedScripts = publishedScriptsRaw.map((script) => ({
		...script,
		isDraft: false,
	}));

	return (
		<SandboxWorkspace
			draftScripts={draftScripts}
			initialSession={session}
			publishedScripts={publishedScripts}
			selectedScript={selectedScript}
			selectedSessionId={sessionId ?? null}
		/>
	);
}
