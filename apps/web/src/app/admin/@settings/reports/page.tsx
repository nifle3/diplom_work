import { serverTrpc } from "@/lib/trpcServer";
import { ReportTable } from "@/components/reportTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const reports = await trpcCaller.report.adminList();

	return <ReportTable canManage data={reports} />;
}
