import { serverTrpc } from "@/lib/trpcServer";
import { EmptyAchievements } from "./_components/emptyAchievements";
import { MyAchievementsTable } from "./_components/myAchivementsTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.profile.getMyAchivements();

	if (!data || data.length == 0) {
		return <EmptyAchievements />;
	}

	return <MyAchievementsTable data={data} />;
}
