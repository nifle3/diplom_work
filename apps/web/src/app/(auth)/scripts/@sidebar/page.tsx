import { serverTrpc } from "@/lib/trpcServer";
import { ScriptsFilters } from "./_components/scriptsFilters";

interface SidebarProps {
  searchParams: Promise<{
    categoryId?: string;
    search?: string;
  }>;
}

export default async function SidebarSlot({ searchParams }: SidebarProps) {
  const { categoryId, search } = await searchParams;
  const trpcCaller = await serverTrpc();
  const categories = await trpcCaller.script.categories();

  return (
    <aside className="sticky top-20">
      <ScriptsFilters
        categories={categories}
        currentCategoryId={categoryId}
        currentSearch={search}
      />
    </aside>
  );
}
