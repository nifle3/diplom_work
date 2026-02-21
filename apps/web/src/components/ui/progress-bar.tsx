import * as React from "react";

interface ProgressBarProps {
  percent: number; // 0-100
  className?: string;
}

export function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden ${className}`}
    >
      <div
        style={{ width: `${clamped}%` }}
        className="h-full bg-blue-600 dark:bg-blue-400 transition-all"
      />
    </div>
  );
}
