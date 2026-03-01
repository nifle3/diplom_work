import InterviewWindow from "./interviewWindow";

export const metadata = {
	title: "Интервью",
};

export default async function InterviewPage({
	params,
}: {
	params: Promise<{id: string}>
}) {
	const { id }= await params;

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<InterviewWindow scriptId={id} />
		</div>
	);
}
