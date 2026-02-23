import Header from "../../components/header";
import InterviewWindow from "../../components/interview-window";

export const metadata = {
  title: "Интервью",
};

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <InterviewWindow />
    </div>
  );
}
