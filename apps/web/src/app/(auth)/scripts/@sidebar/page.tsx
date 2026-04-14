import { serverTrpc } from "@/lib/trpcServer";
import { CategoriesFilter } from "./_components/categoriesFilter";
import { SearchCourses } from "./_components/searchCourses";

interface SidebarProps {
	searchParams: Promise<{
		categoryId?: number;
		search?: string;
	}>;
}

export default async function SidebarSlot({ searchParams }: SidebarProps) {
	const { categoryId: _categoryId, search: _search } = await searchParams;
	const trpcCaller = await serverTrpc();
	const categories = await trpcCaller.script.categories();
	const categoriesForQuery = categories.map((val) => {
		return {
			id: val.id.toString(),
			name: val.name,
		};
	});

	return (
		<aside className="sticky top-20">
			<div className="space-y-6">
				<SearchCourses />
				<CategoriesFilter categories={categoriesForQuery} />
			</div>
		</aside>
	);
}
