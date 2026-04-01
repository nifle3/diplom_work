import { serverTrpc } from "@/lib/trpcServer";

import FirstStepForm from "./_components/form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const scriptId = (await params).id;

	const trpcCaller = await serverTrpc();
	const { 0: data, 1: categories } = await Promise.all([
		trpcCaller.expert.getFullScript(scriptId),
		trpcCaller.script.categories(),
	]);

	return <FirstStepForm initialData={data} categories={categories} />;
}
