import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const recentActivity = await trpcCaller.activity.getLatestUserActivity();

	return (
		<>
			{recentActivity?.length ? (
				<div className="grid grid-cols-3 gap-6">
					{recentActivity.map((activity) => (
						<Card
							key={activity.id}
							className="flex h-24 flex-col justify-between p-4"
						>
							<div className="font-medium text-base">{activity.title}</div>
						</Card>
					))}
				</div>
			) : (
				<div className="text-gray-500">Нет недавней активности</div>
			)}
		</>
	);
}
