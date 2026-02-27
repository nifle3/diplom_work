"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface CourseCardProps {
	id: string;
	title: string;
	context: string;
	categoryName: string;
	expertName: string;
}

export function CourseCard({
	id,
	title,
	context,
	categoryName,
	expertName,
}: CourseCardProps) {
	return (
		<Link href={`/interview?scenario=${id}`}>
			<Card className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-lg">
				{/* Header image placeholder */}
				<div className="flex h-24 items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
					<span className="font-bold text-2xl text-white opacity-50">
						{title.charAt(0)}
					</span>
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col justify-between px-4 py-4">
					{/* Title and category */}
					<div>
						<h3 className="mb-2 line-clamp-2 font-semibold text-sm">{title}</h3>
						<p className="mb-3 line-clamp-2 text-gray-500 text-xs dark:text-gray-400">
							{context}
						</p>
						<div className="mb-3 flex items-center gap-2">
							<span className="inline-block rounded bg-blue-100 px-2 py-1 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
								{categoryName}
							</span>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t pt-3 text-gray-500 text-xs dark:text-gray-400">
						Эксперт: {expertName}
					</div>
				</div>
			</Card>
		</Link>
	);
}

export function CourseCardSkeleton() {
	return (
		<Card className="flex h-full flex-col">
			<Skeleton className="h-24 w-full" />
			<div className="flex flex-1 flex-col gap-3 px-4 py-4">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-6 w-1/2" />
				<div className="flex-1" />
				<Skeleton className="h-8 w-full" />
			</div>
		</Card>
	);
}
