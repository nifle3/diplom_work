import { serverTrpc } from "@/lib/trpcServer";

import FirstStepForm from "./_components/form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const scriptId = (await params).id;

	console.debug(`scriptId is ${scriptId}`);

	const trpcCaller = await serverTrpc();
	const { 0: data, 1: categories } = await Promise.all([
		trpcCaller.expert.getFullScript(scriptId),
		trpcCaller.script.categories()
	]);

	console.debug(`getFullScript id is ${data.id}`);
	console.debug(`Categories: ${categories}`);
	console.debug('Categories (detailed):', JSON.stringify(categories, null, 2));

	return <FirstStepForm initialData={data} categories={categories} />
}
