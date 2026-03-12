import { serverTrpc } from "@/lib/trpcServer";
import { SharedScriptsTable } from "../_components/sharedScriptsTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const scripts = await trpcCaller.expert.getMyDrafts();

	return <SharedScriptsTable isDraftTable={true} data={scripts} />;
}
