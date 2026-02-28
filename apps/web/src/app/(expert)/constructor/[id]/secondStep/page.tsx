import { serverTrpc } from "@/lib/trpcServer";

import SecondStepForm from "./form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const draftId = (await params).id;
	
	const trpcCaller = await serverTrpc();
	const { 0: data, 1: criteriaTypes} = await Promise.all([
		trpcCaller.expert.getFullScript(draftId),
		trpcCaller.script.criteriaTypes()
	]);

	return <SecondStepForm initialData={data} criteriaTypes={criteriaTypes} />;
}
