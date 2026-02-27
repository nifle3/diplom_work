import { serverTrpc } from "@/lib/trpcServer";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const draftId = await params;
	const trpcCaller = await serverTrpc();

	return <></>;
}
