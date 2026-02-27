import { serverTrpc } from "@/lib/trpcServer";
import type { Metadata } from "next"
import TableSelector from "./tableSelector";

export const metadata: Metadata = {
    title: "Мой профиль"
};

export default async function Page() {
    const trpcCaller = await serverTrpc();
    const user = trpcCaller.profile.getMyProfile();

    return (
        <>
            <h2>user.name</h2>
            <h2>user streak</h2>
            <h2>Опыт</h2>

            <TableSelector/>
        </>
    )
}