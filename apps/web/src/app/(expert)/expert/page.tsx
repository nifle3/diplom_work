import type { Metadata } from "next";

import { serverTrpc } from "@/lib/trpcServer";
import CreateScriptButton from "./createScriptButton";

export const metadata: Metadata = {
  title: "Рабочий кабинет эксперта",
};

export default async function ExpertPage() {
  const trpc = await serverTrpc();

  const { 0: scripts, 1: drafts} = await Promise.all([
    trpc.expert.getMyScripts(),
    trpc.expert.getMyDrafts()
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold">Рабочий кабинет эксперта</h1>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <CreateScriptButton/>
          </div>
          <h2 className="text-xl font-semibold">Мои черновики</h2>
          {
            drafts.map((value) =>  (
              <>
              </>
            ))
          }
          <h2 className="text-xl font-semibold">Мои сценарии</h2>
                    {
            scripts.map((value) =>  (
              <>
              </>
            ))
          }
        </section>
      </main>
    </div>
  );
}
