import Link from "next/link";
import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

export default async function DashboardPage() {
	const trpcCaller = await serverTrpc();

	const userStats = await trpcCaller.user.getStats();
	const recentActivity = await trpcCaller.activity.getLatestUserActivity();
	const latestCourses = await trpcCaller.script.getLatest({ limit: 5 });

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto max-w-4xl px-6 py-16">
				<div className="mb-12 flex items-center justify-between">
					<h1 className="font-bold text-3xl">Привет, {userStats.name}</h1>
					<div className="rounded-full bg-yellow-200 px-3 py-1 font-medium text-sm text-yellow-900">
						Стрик: {userStats.streak} дней
					</div>
				</div>

				<section className="mb-16">
					<h2 className="mb-4 font-semibold text-xl">Последняя активность</h2>
					{recentActivity?.length ? (
						<div className="grid grid-cols-3 gap-6">
							{recentActivity.map((activity) => (
								<Card
									key={activity.id}
									className="flex h-24 flex-col justify-between p-4"
								>
									<div className="font-medium text-base">{activity.title}</div>
								</Card>
							))}
						</div>
					) : (
						<div className="text-gray-500">Нет недавней активности</div>
					)}
				</section>

				<section>
					<h2 className="mb-6 font-semibold text-xl">Новые курсы</h2>
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
				</section>
			</main>
		</div>
	);
}
