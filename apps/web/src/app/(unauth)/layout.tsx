import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { auth } from "@diplom_work/auth/index";

import PublicHeader from "@/components/publicHeader";

export default async function UnauthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard", RedirectType.replace);
  }

  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}
