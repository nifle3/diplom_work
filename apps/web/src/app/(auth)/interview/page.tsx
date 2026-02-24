import InterviewWindow from "@/components/interview-window";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Интервью",
};

interface InterviewPageProps {
  searchParams: Promise<{ scenario?: string }>;
}

export default async function InterviewPage({ searchParams }: InterviewPageProps) {
  const params = await searchParams;
  const scenarioId = params.scenario;

  if (!scenarioId) {
    redirect("/scripts");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <InterviewWindow scenarioId={scenarioId} />
    </div>
  );
}
