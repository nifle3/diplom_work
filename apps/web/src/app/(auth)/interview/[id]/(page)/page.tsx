import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { serverTrpc } from "@/lib/trpcServer";
import { Button } from "@/components/ui/button";
import { CancelInterviewButton } from "./_components/cancelInterviewButton";
import { InterviewChatFooter } from "./_components/interviewChatFooter";
import { InterviewLiveMessages } from "./_components/interviewLiveMessages";
import { InterviewProvider } from "./_components/interviewProvider";
import { MessageItem } from "./_components/messageItem";
import { getBackHref } from "../results/_lib/getBackHref";

export const metadata = {
	title: "Интервью",
};

export default async function InterviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();
	const { 0: data, 1: script } = await Promise.all([
		trpcCaller.session.getAllHistory(id),
		trpcCaller.session.getScriptByInterviewId(id),
	]);
	const backHref = getBackHref(script?.id ?? null);

	return (
		<InterviewProvider interviewId={id}>
			<div className="flex h-screen flex-col bg-background text-foreground">
				<header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
					<h1 className="min-w-0 truncate font-semibold text-base">
						{script.title ?? ""}
					</h1>
					<div className="flex shrink-0 items-center gap-2">
						<Button asChild variant="outline" size="sm">
							<Link href={backHref as Route}>
								<ChevronLeft className="size-4" />
								Назад
							</Link>
						</Button>
						<CancelInterviewButton />
					</div>
				</header>

				<main className="flex-1 overflow-y-auto px-4">
					<div className="mx-auto max-w-3xl space-y-6 py-6">
						{(data ?? []).map((message) => (
							<MessageItem key={message.id} message={message} />
						))}
						<InterviewLiveMessages />
					</div>
				</main>

				<footer className="shrink-0 border-t p-4">
					<div className="mx-auto max-w-3xl">
						<InterviewChatFooter />
					</div>
				</footer>
			</div>
		</InterviewProvider>
	);
}
