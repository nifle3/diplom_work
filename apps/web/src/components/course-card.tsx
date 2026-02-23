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
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {/* Header image placeholder */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24 flex items-center justify-center">
          <span className="text-white text-2xl font-bold opacity-50">
            {title.charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-4 flex-1 flex flex-col justify-between">
          {/* Title and category */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {context}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {categoryName}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
            Эксперт: {expertName}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <Skeleton className="w-full h-24" />
      <div className="px-4 py-4 flex-1 flex flex-col gap-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-6" />
        <div className="flex-1" />
        <Skeleton className="w-full h-8" />
      </div>
    </Card>
  );
}
