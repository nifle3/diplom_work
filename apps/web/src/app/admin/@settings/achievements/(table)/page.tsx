import { serverTrpc } from "@/lib/trpcServer";
import { AchievementsTable } from "./_components/achievementsTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.achievement.getAll();

	return <AchievementsTable data={data} />;
}
