import { serverTrpc } from "@/lib/trpcServer";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.script.getInfo(id);

	// TODO: переделать всё на shadcn/ui
	return (
		<>
			<h2>{data.title}</h2>
			<span>Создано: {data.draftOverAt?.toDateString()}</span>
			<span>{data.description}</span>
			<button>Начать сессию</button>
		</>
	);
}
