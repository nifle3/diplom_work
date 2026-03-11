import { serverTrpc } from "@/lib/trpcServer";

export default async function Layout() {
	const trpcCaller = await serverTrpc();
	const userStats = await trpcCaller.user.getStats();

	return (
		<>
			<h1 className="font-bold text-3xl">Привет, {userStats.name}</h1>
			<div className="rounded-full bg-yellow-200 px-3 py-1 font-medium text-sm text-yellow-900">
				Стрик: {userStats.streak} дней
			</div>
		</>
	);
}
