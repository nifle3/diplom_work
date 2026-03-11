import Link from "next/link";
import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const latestCourses = await trpcCaller.script.getLatest({ limit: 5 });

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{latestCourses?.map((course) => (
				<Card key={course.id} className="flex h-40 flex-col">
					<div className="h-20 bg-gray-200 dark:bg-gray-700" />
					<div className="flex flex-1 flex-col justify-between px-4 py-2">
						<div className="font-medium text-sm">{course.title}</div>
						<Link
							href={{ pathname: `/script/${course.id}` }}
							className="text-blue-600 text-xs hover:underline"
						>
							Открыть
						</Link>
					</div>
				</Card>
			))}
		</div>
	);
}
