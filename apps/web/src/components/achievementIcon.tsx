"use client";

import { Trophy } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAssetUrl } from "@/lib/assetUrl";

type AchievementIconProps = {
	iconUrl: string | null;
	alt: string;
	earned?: boolean;
	className?: string;
};

export function AchievementIcon({
	iconUrl,
	alt,
	earned = false,
	className,
}: AchievementIconProps) {
	const assetUrl = getAssetUrl(iconUrl);

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center overflow-hidden border",
				earned
					? "border-amber-200 bg-amber-100 dark:border-amber-900/30 dark:bg-amber-900/30"
					: "border-border bg-muted",
				className,
			)}
		>
			{assetUrl ? (
				<Image
					src={assetUrl}
					alt={alt}
					width={64}
					height={64}
					className="h-full w-full object-cover"
					unoptimized
				/>
			) : (
				<Trophy
					className={cn(
						"h-5 w-5",
						earned
							? "text-amber-600 dark:text-amber-400"
							: "text-muted-foreground",
					)}
				/>
			)}
		</div>
	);
}
