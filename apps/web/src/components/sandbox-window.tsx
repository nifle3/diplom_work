"use client";
import * as React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";

export default function SandboxWindow() {
	// mock data only — no logic yet
	const scenarioName = "Окно песочницы";
	const progress = 18; // percent
	const experience = 0;

	return (
		<main className="mx-auto max-w-5xl px-6 py-12">
			<div className="mb-3 flex items-center justify-between">
				<h1 className="font-semibold text-2xl">{scenarioName}</h1>

				<div className="flex items-center gap-3">
					<Button size="sm" variant="ghost">
						Закончить
					</Button>
					<Button size="sm" variant="outline">
						Рестарт
					</Button>

					<div className="flex items-center gap-2">
						<div className="rounded bg-gray-100 px-3 py-1 font-medium text-sm dark:bg-gray-800">
							Опыт: {experience}
						</div>
						<div className="h-6 w-6 rounded-full bg-black" />
					</div>
				</div>
			</div>

			<ProgressBar percent={progress} className="mb-8" />

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<Card className="flex h-36 items-center justify-center bg-gray-100">
						<div className="text-gray-600 text-sm">Большой блок 1 (мок)</div>
					</Card>

					<Card className="flex h-36 items-center justify-center bg-gray-100">
						<div className="text-gray-600 text-sm">Большой блок 2 (мок)</div>
					</Card>
				</div>

				<div className="flex flex-col gap-6">
					<div className="flex-1">
						<Card className="flex h-44 items-center justify-center bg-gray-100">
							<div className="text-gray-600 text-sm">Редактировать</div>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
