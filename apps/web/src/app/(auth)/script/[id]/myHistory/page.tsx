import { HistoryScriptTable } from "@/components/historyScriptTable";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page({
	params: _params,
}: {
	params: Promise<{ id: string }>;
}) {
	const trpcCaller = await serverTrpc();
	const result = await trpcCaller.script.getUserHistory();

	return <HistoryScriptTable data={result}/>;
}
