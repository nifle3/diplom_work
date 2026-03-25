import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page({
	params: _params,
}: {
	params: Promise<{ id: string }>;
}) {
	const trpcCaller = await serverTrpc();
	const result = await trpcCaller.script.getUserHistory();

	return <></>;
}
