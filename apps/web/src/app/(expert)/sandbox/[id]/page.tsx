import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SandboxChat } from "./_components/sandboxChat";
import { SandboxProvider } from "./_components/sandboxProvider";

export const metadata: Metadata = {
	title: "Sandbox эксперта",
};

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: scriptId } = await params;

	return (
		<SandboxProvider scriptId={scriptId}>
			<div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
				<header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-3">
					<h1 className="min-w-0 truncate font-semibold text-base">
						Sandbox: {scriptId}
					</h1>
					<div className="flex shrink-0 items-center gap-2">
						<Button asChild variant="outline" size="sm">
							<Link href="/expert" className="flex items-center gap-2">
								<ChevronLeft className="size-4" />
								Назад к сценариям
							</Link>
						</Button>
					</div>
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
					<div className="mx-auto max-w-3xl space-y-6 py-6">
						<SandboxChat />
					</div>
				</div>
			</div>
		</SandboxProvider>
	);
}
