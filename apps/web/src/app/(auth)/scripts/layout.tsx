import type { ReactNode } from "react";

export default function ScriptsLayout({ sidebar, list }: Readonly<{
  sidebar: ReactNode,
  list: ReactNode,
}>) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <main className="mx-auto flex max-w-7xl gap-8 px-6 py-12">
        <aside className="w-64 shrink-0">
          {sidebar}
        </aside>
        <section className="flex-1">
          {list}
        </section>
      </main>
    </div>
  );
}
