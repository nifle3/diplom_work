import { HistoryScriptTable } from "@/components/historyScriptTable";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();
	const result = await trpcCaller.script.getUserHistoryByScript(id);

	return <HistoryScriptTable data={result} />;
}
