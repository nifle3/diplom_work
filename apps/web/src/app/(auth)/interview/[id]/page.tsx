import { redirect } from "next/navigation";
import InterviewWindow from "@/components/interview-window";

export const metadata = {
	title: "Интервью",
};

export default async function InterviewPage({
	params,
}: {
	params: Promise<{id: string}>
}) {
	const id = (await params).id;

	if (!id) {
		redirect("/scripts");
	}

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<InterviewWindow scenarioId={id} />
		</div>
	);
}
