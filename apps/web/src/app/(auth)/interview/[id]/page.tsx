import { serverTrpc } from "@/lib/trpcServer";
import { InterviewChatFooter } from "./_components/interviewChatFooter";
import { InterviewLiveMessages } from "./_components/interviewLiveMessages";
import { FinishInterviewButton } from "./_components/finishInterviewButton";
import { InterviewProvider } from "./_components/interviewProvider";
import { MessageItem } from "./_components/messageItem";

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

	return (
		<InterviewProvider interviewId={id}>
			<div className="flex h-screen flex-col bg-background text-foreground">
				<header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
					<h1 className="font-semibold text-base">{script.title ?? ""}</h1>
					<FinishInterviewButton />
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
