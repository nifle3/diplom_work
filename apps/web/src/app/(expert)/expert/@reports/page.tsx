import { ReportTable } from "@/components/reportTable";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const reports = await trpcCaller.report.expertList();

	return <ReportTable data={reports} />;
}
