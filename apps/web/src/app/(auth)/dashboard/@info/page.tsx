import { serverTrpc } from "@/lib/trpcServer";

export default async function Layout() {
	const trpcCaller = await serverTrpc();
	const { 0: userStats, 1: streak } = await Promise.all([
		trpcCaller.user.getStats(),
		trpcCaller.user.getStreak(),
	]);

	return (
		<>
			<h1 className="min-w-0 font-bold text-3xl">
				Привет,{" "}
				<span
					className="inline-block max-w-[200px] truncate align-bottom"
					title={userStats.name}
				>
					{userStats.name}
				</span>
			</h1>
			<div className="rounded-full bg-yellow-200 px-3 py-1 font-medium text-sm text-yellow-900">
				Стрик: {streak} дней
			</div>
		</>
	);
}
