import { ReportTable } from "@/components/reportTable";
import { serverTrpc } from "@/lib/trpcServer";
import { EmptyReports } from "./_components/emptyReports";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.report.myList();

	if (!data || data.length === 0) {
		return <EmptyReports />;
	}

	return (
		<ReportTable
			data={data}
			emptyMessage="У вас пока нет жалоб"
			showReporter={false}
		/>
	);
}
