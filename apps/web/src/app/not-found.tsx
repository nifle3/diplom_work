import { Compass, LogIn } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function GlobalNotFound() {
	return (
		<main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
			<div className="-z-10 pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.12),transparent_45%)]" />

			<Card className="w-full max-w-xl border-border/70 bg-card/95 backdrop-blur">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto flex size-14 items-center justify-center rounded-full border bg-muted">
						<Compass className="size-6 text-muted-foreground" />
					</div>

					<div className="space-y-2">
						<p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
							Ошибка 404
						</p>
						<CardTitle className="text-3xl tracking-tight sm:text-4xl">
							Страница не найдена
						</CardTitle>
						<CardDescription className="mx-auto max-w-md text-base leading-6">
							Похоже, ссылка устарела или адрес был введён с ошибкой.
							Попробуйте вернуться назад или перейти на главную страницу.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link href="/">На главную</Link>
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
