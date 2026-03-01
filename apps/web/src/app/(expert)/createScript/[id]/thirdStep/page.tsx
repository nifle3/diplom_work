import { serverTrpc } from "@/lib/trpcServer";

import ThirdStepForm from "./form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const draftId = (await params).id;

	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.expert.getFullScript(draftId);

	return <ThirdStepForm initialData={data} />;
}
