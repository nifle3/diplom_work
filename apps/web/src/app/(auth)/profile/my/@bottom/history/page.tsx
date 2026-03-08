import { serverTrpc } from "@/lib/trpcServer";
import { EmptyHistory } from "./_components/emptyHistory";
import { MyHistoryTable } from "./_components/myHistoryTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.profile.getMyHistory();

	if (!data || data.length === 0) {
		return <EmptyHistory />;
	}

	return <MyHistoryTable data={data} />;
}
