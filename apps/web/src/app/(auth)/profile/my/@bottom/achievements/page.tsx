import { serverTrpc } from "@/lib/trpcServer"
import { MyAchievementsTable } from "./_components/myAchivementsTable";
import { EmptyAchievements } from "./_components/emptyAchievements";

export default async function Page() {
    const trpcCaller = await serverTrpc();
    const data = await trpcCaller.profile.getMyAchivements();

    if (!data || data.length == 0) {
        return <EmptyAchievements/>
    }

    return <MyAchievementsTable data={data}/>
}