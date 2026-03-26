"use client";

import Image from "next/image";
import Link from "next/link";
import { getAssetUrl } from "@/lib/assetUrl";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type Script = {
	id: string;
	title: string;
	image: string | null;
	description: string;
	categoryName: string;
	expertId: string;
	expertName: string;
};

type ScriptCardProps = {
	script: Script;
};

export function ScriptCard({ script }: ScriptCardProps) {
	const imageSrc = getAssetUrl(script.image);

	return (
		<Card className="relative flex h-full flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
			<Link
				href={{ pathname: `/script/${script.id}` }}
				aria-label={`Перейти к курсу ${script.title}`}
				className="absolute inset-0 z-0 rounded-xl"
			/>

			<div className="flex h-32 items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
				{imageSrc ? (
					<Image
						alt={script.title}
						className="h-full w-full object-cover"
						src={imageSrc}
					/>
				) : (
					<span className="font-bold text-2xl text-white opacity-50">
						{script.title.charAt(0)}
					</span>
				)}
			</div>

			<div className="relative z-10 flex flex-1 flex-col justify-between px-4 py-4">
				<div>
					<h3 className="mb-2 line-clamp-2 font-semibold text-sm">
						{script.title}
					</h3>
					<p className="mb-3 line-clamp-2 text-gray-500 text-xs dark:text-gray-400">
						{script.description}
					</p>
					<div className="mb-3 flex items-center gap-2">
						<span className="inline-block rounded bg-blue-100 px-2 py-1 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
							{script.categoryName}
						</span>
					</div>
				</div>

				<div className="border-t pt-3 text-gray-500 text-xs dark:text-gray-400">
					Эксперт:{" "}
					<Link
						href={{ pathname: `/profile/expert/${script.expertId}` }}
						className="relative z-20 font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
					>
						{script.expertName}
					</Link>
				</div>
			</div>
		</Card>
	);
}

export function ScriptCardSkeleton() {
	return (
		<Card className="flex h-full flex-col gap-0 py-0">
			<Skeleton className="h-32 w-full" />
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
