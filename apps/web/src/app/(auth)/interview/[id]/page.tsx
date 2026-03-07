import { serverTrpc } from "@/lib/trpcServer";
import InterviewWindow from "./_components/interviewWindow";

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
	const data = undefined;

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<InterviewWindow
				scriptId={id}
				onEnd={() => {}}
				onSendMessage={async () => {}}
			/>
		</div>
	);
}
