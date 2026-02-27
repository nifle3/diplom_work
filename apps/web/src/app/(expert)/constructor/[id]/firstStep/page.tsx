import { serverTrpc } from "@/lib/trpcServer";

import FirstStepForm from "./form";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const draft = await params;
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.expert.getFullScript(draft.id);

	return (
		<>
			<FirstStepForm />
		</>
	);
}
