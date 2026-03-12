import { serverTrpc } from "@/lib/trpcServer";
import { ExpertsTable } from "./_components/expertsTable";

export default async function ExpertsPage() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.expertManager.getAll();

	return <ExpertsTable data={data} />;
}
