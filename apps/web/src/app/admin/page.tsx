import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Главная страница админа",
};

export default function Page() {
	return (
		<div className="flex min-h-[400px] flex-col items-start justify-center gap-4 rounded-xl border bg-card p-8 shadow-sm">
			<p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
				Админ-панель
			</p>
			<h1 className="font-bold text-3xl">Управление платформой</h1>
			<p className="max-w-2xl text-muted-foreground leading-7">
				Здесь собраны основные административные разделы, включая категории,
				экспертов, достижения и жалобы на курсы.
			</p>
			<Button asChild>
				<Link href={"/admin/reports" as any}>Перейти к жалобам</Link>
			</Button>
		</div>
	);
}
