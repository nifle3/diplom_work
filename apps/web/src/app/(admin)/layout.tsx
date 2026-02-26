import { redirect, RedirectType } from "next/navigation";

import { serverTrpc } from "@/lib/trpcServer"

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const trpcCaller = await serverTrpc();

  const isUserAdmin = await trpcCaller.user.isUserHasRole("admin");
  if (!isUserAdmin) {
    redirect("/dashboard", RedirectType.replace);
  }

  return (
    <>
      {children}
    </>
  )
}
