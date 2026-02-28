import { serverTrpc } from "@/lib/trpcServer";

import SecondStepForm from "./form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const draftId = await params;
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.expert.getFullScript(draftId.id);
	const criteriaTypes = await trpcCaller.script.criteriaTypes();

	return <SecondStepForm initialData={data} criteriaTypes={criteriaTypes} />;
}
