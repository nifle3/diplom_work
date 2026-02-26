import { redirect, RedirectType } from "next/navigation";

import { serverTrpc } from "@/lib/trpcServer"

export default async function ExpertLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const trpcCaller = await serverTrpc();

    const isUserExpert = await trpcCaller.user.isUserHasRole("expert");
    if (!isUserExpert) {
        redirect("/dashboard", RedirectType.replace);
    }

    return (
        <>
            {children}
        </>
    )
}