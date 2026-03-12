import { serverTrpc } from "@/lib/trpcServer";
import { CategoriesTable } from "./_components/categoriesTable";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.category.getAll();

	return <CategoriesTable data={data} />;
}
