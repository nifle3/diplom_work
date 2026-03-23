import { ScriptCard } from "@/components/scriptCard";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const latestCourses = await trpcCaller.script.getLatest({ limit: 5 });

	return (
		<>
			{latestCourses?.map((script) => (
				<ScriptCard script={script} key={script.id} />
			))}
		</>
	);
}
